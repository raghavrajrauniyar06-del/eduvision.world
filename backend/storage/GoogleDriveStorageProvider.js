const { google } = require('googleapis');
const stream = require('stream');

class GoogleDriveStorageProvider {
  constructor(authClient) {
    this.name = 'google_drive';
    this.authClient = authClient;
    this.drive = google.drive({ version: 'v3', auth: this.authClient });

    // In-memory root folder ID cache (e.g. Eduvision Central Data, Leads, Year)
    this.folderCache = new Map();
  }

  /**
   * Helper to safely execute Google Drive calls with auto-retry
   */
  async _safeDriveCall(fn, fallbackValue = null) {
    try {
      return await fn();
    } catch (err) {
      console.warn('[GoogleDriveStorageProvider] Drive API Notice:', err.message || err);
      if (err.code === 429 || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
        try {
          await new Promise(r => setTimeout(r, 300));
          return await fn();
        } catch (retryErr) {
          console.warn('[GoogleDriveStorageProvider] Retry notice:', retryErr.message || retryErr);
        }
      }
      return fallbackValue;
    }
  }

  /**
   * Sanitize string for folder/file names
   */
  sanitizeName(name) {
    if (!name) return 'Unknown';
    return name
      .replace(/[\/\?<>\\:\*\|":]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[-_]+/g, '-')
      .trim();
  }

  /**
   * Helper to escape CSV fields
   */
  escapeCsvValue(val) {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  }

  /**
   * Get or create Master Hub Root Folder: "Eduvision Central Data"
   */
  async getRootHubFolder() {
    let rootId = await this.getOrCreateFolder('Eduvision Central Data');
    if (!rootId) {
      rootId = await this.getOrCreateFolder('EduVision');
    }
    return rootId;
  }

  /**
   * Find a folder by name inside a parent, or create it if not found (Fault-tolerant)
   */
  async getOrCreateFolder(folderName, parentFolderId = null) {
    const cacheKey = `${parentFolderId || 'root'}_${folderName}`;
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey);
    }

    // 1. Search for existing folder
    let query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    try {
      const listRes = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
        pageSize: 1
      });

      if (listRes.data && listRes.data.files && listRes.data.files.length > 0) {
        const folderId = listRes.data.files[0].id;
        this.folderCache.set(cacheKey, folderId);
        return folderId;
      }
    } catch(err) {
      console.warn(`[Drive] Folder search notice for ${folderName}:`, err.message);
    }

    // 2. Create folder if not found
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      };

      const createRes = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      if (createRes.data && createRes.data.id) {
        const newFolderId = createRes.data.id;
        this.folderCache.set(cacheKey, newFolderId);
        return newFolderId;
      }
    } catch(err) {
      console.warn(`[Drive] Folder creation notice for ${folderName}:`, err.message);
    }

    return null;
  }

  /**
   * Lazily resolves or creates folder hierarchy for call recording
   */
  async resolveCallRecordingFolder(leadId, studentName, dateStr, cachedLeadFolderId = null) {
    try {
      const year = (dateStr || '').split('-')[0] || new Date().getFullYear().toString();
      const safeStudentName = this.sanitizeName(studentName);
      const leadFolderName = `${leadId}_${safeStudentName}`;

      const eduvisionRootId = await this.getRootHubFolder();
      const leadsRootId = await this.getOrCreateFolder('Leads-CRM', eduvisionRootId);
      const yearFolderId = await this.getOrCreateFolder(year, leadsRootId);

      let leadFolderId = cachedLeadFolderId;
      if (!leadFolderId) {
        leadFolderId = await this.getOrCreateFolder(leadFolderName, yearFolderId);
      }

      const dateFolderId = await this.getOrCreateFolder(dateStr || 'Recent', leadFolderId);
      const callRecordingsFolderId = await this.getOrCreateFolder('Call-Recordings', dateFolderId);

      return {
        leadFolderId: leadFolderId || 'drive_leads',
        callRecordingsFolderId: callRecordingsFolderId || eduvisionRootId || 'root'
      };
    } catch(err) {
      console.warn('[Drive] Hierarchy resolution fallback:', err.message);
      return { leadFolderId: null, callRecordingsFolderId: null };
    }
  }

  /**
   * Upload Call Recording audio to Google Drive
   */
  async uploadCallRecording({ fileBuffer, fileName, mimeType, leadId, studentName, dateStr, cachedLeadFolderId }) {
    const { leadFolderId, callRecordingsFolderId } = await this.resolveCallRecordingFolder(
      leadId,
      studentName,
      dateStr,
      cachedLeadFolderId
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: fileName,
      parents: callRecordingsFolderId ? [callRecordingsFolderId] : []
    };

    const media = {
      mimeType: mimeType || 'audio/mpeg',
      body: bufferStream
    };

    const res = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, size, mimeType'
    });

    return {
      fileId: res.data.id,
      fileName: res.data.name,
      fileSize: res.data.size,
      mimeType: res.data.mimeType,
      leadFolderId: leadFolderId,
      folderId: callRecordingsFolderId,
      webViewLink: res.data.webViewLink,
      storageProvider: 'google_drive'
    };
  }

  /**
   * Securely stream file by ID
   */
  async getFileStream(fileId, customHeaders = {}) {
    const res = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream', headers: customHeaders || {} }
    );
    return res.data;
  }

  /**
   * Get metadata for a file
   */
  async getFileMetadata(fileId) {
    const res = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, webViewLink'
    });
    return res.data;
  }

  /**
   * Lazily resolves or creates folder hierarchy for student documents
   */
  async resolveStudentDocumentsFolder(studentId, studentName) {
    try {
      const safeName = this.sanitizeName(studentName);
      const studentFolderName = `${studentId}_${safeName}`;

      const eduvisionRootId = await this.getRootHubFolder();
      const studentsRootId = await this.getOrCreateFolder('Students-Dossiers', eduvisionRootId);
      const studentFolderId = await this.getOrCreateFolder(studentFolderName, studentsRootId);
      const docsFolderId = await this.getOrCreateFolder('Documents', studentFolderId);

      return { studentFolderId, docsFolderId };
    } catch(err) {
      console.warn('[Drive] Student docs folder resolution fallback:', err.message);
      return { studentFolderId: null, docsFolderId: null };
    }
  }

  /**
   * Upload Student Document (PDF, Image, etc.)
   */
  async uploadStudentDocument({ fileBuffer, fileName, mimeType, studentId, studentName, documentType }) {
    const { studentFolderId, docsFolderId } = await this.resolveStudentDocumentsFolder(studentId, studentName);

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: fileName,
      parents: docsFolderId ? [docsFolderId] : []
    };

    const media = {
      mimeType: mimeType || 'application/pdf',
      body: bufferStream
    };

    const res = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink, size, mimeType'
    });

    try {
      await this.drive.permissions.create({
        fileId: res.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });
    } catch(permErr) {}

    return {
      fileId: res.data.id,
      fileName: res.data.name,
      fileSize: res.data.size,
      mimeType: res.data.mimeType,
      documentType: documentType,
      studentId: studentId,
      studentFolderId: studentFolderId,
      folderId: docsFolderId,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink,
      storageProvider: 'google_drive'
    };
  }

  /**
   * Lazily resolves or creates folder hierarchy for student payment receipts
   */
  async resolveStudentPaymentsFolder(studentId, studentName) {
    try {
      const safeName = this.sanitizeName(studentName);
      const studentFolderName = `${studentId}_${safeName}`;

      const eduvisionRootId = await this.getRootHubFolder();
      const studentsRootId = await this.getOrCreateFolder('Students-Dossiers', eduvisionRootId);
      const studentFolderId = await this.getOrCreateFolder(studentFolderName, studentsRootId);
      const paymentsFolderId = await this.getOrCreateFolder('Payments', studentFolderId);

      return { studentFolderId, paymentsFolderId };
    } catch(err) {
      console.warn('[Drive] Student payments folder resolution fallback:', err.message);
      return { studentFolderId: null, paymentsFolderId: null };
    }
  }

  /**
   * Upload Student Payment Receipt
   */
  async uploadStudentPaymentReceipt({ fileBuffer, fileName, mimeType, studentId, studentName, feeType, amount, transactionId }) {
    const { studentFolderId, paymentsFolderId } = await this.resolveStudentPaymentsFolder(studentId, studentName);

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: fileName,
      parents: paymentsFolderId ? [paymentsFolderId] : []
    };

    const media = {
      mimeType: mimeType || 'application/pdf',
      body: bufferStream
    };

    const res = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink, size, mimeType'
    });

    try {
      await this.drive.permissions.create({
        fileId: res.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });
    } catch(permErr) {}

    return {
      fileId: res.data.id,
      fileName: res.data.name,
      fileSize: res.data.size,
      mimeType: res.data.mimeType,
      feeType: feeType,
      amount: amount,
      transactionId: transactionId,
      studentId: studentId,
      studentFolderId: studentFolderId,
      folderId: paymentsFolderId,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink,
      storageProvider: 'google_drive'
    };
  }

  /**
   * Helper: save or update Native Google Spreadsheet directly into Google Drive Folder
   */
  async _saveCsvToDriveFolder(sheetName, csvContent, folderId, extraMeta = {}) {
    try {
      const cleanName = (sheetName || '').replace(/\.csv$/i, '').replace(/_/g, ' ');
      let query = `name = '${cleanName}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
      if (folderId) query += ` and '${folderId}' in parents`;

      const listRes = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
        pageSize: 1
      });

      const bufferStream = new stream.PassThrough();
      bufferStream.end(Buffer.from('\uFEFF' + csvContent, 'utf-8'));

      let fileRes = null;
      if (listRes.data && listRes.data.files && listRes.data.files.length > 0) {
        const existingFileId = listRes.data.files[0].id;
        fileRes = await this.drive.files.update({
          fileId: existingFileId,
          media: {
            mimeType: 'text/csv',
            body: bufferStream
          },
          fields: 'id, name, webViewLink, webContentLink, size, mimeType, modifiedTime'
        });
      } else {
        fileRes = await this.drive.files.create({
          resource: {
            name: cleanName,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: folderId ? [folderId] : []
          },
          media: {
            mimeType: 'text/csv',
            body: bufferStream
          },
          fields: 'id, name, webViewLink, webContentLink, size, mimeType, modifiedTime'
        });
      }

      try {
        await this.drive.permissions.create({
          fileId: fileRes.data.id,
          requestBody: { role: 'reader', type: 'anyone' }
        });
      } catch(e) {}

      return {
        fileId: fileRes.data.id,
        fileName: cleanName,
        folderId: folderId,
        webViewLink: fileRes.data.webViewLink,
        webContentLink: fileRes.data.webContentLink,
        modifiedTime: fileRes.data.modifiedTime,
        storageProvider: 'google_drive',
        ...extraMeta
      };
    } catch(err) {
      console.warn(`[Drive] Spreadsheet sync notice for ${sheetName}:`, err.message);
      return {
        fileName: sheetName,
        storageProvider: 'local_vault_cloud_pending',
        ...extraMeta
      };
    }
  }

  /**
   * 1. Sync Master All Students Spreadsheet in Google Drive
   */
  async syncAllStudentsSpreadsheet(studentsList) {
    const rootFolderId = await this.getRootHubFolder();
    const studentsFolderId = await this.getOrCreateFolder('Students', rootFolderId);

    const headers = [
      'Student ID', 'Full Name', 'Email', 'Phone', 'Alternative Phone',
      'Gender', 'Date of Birth', 'City', 'State', 'Address',
      'Preferred Course', 'Preferred University', 'Target Country', 'Budget (INR)',
      'Assigned Counsellor', 'Assigned Counsellor ID', 'Assigned Team Leader',
      'Application Status', 'Lead Stage', 'Created Date', 'Last Updated'
    ];

    const rows = [headers.join(',')];
    (studentsList || []).forEach(s => {
      const row = [
        this.escapeCsvValue(s.student_id || s.id || ''),
        this.escapeCsvValue(s.full_name || s.name || ''),
        this.escapeCsvValue(s.email || ''),
        this.escapeCsvValue(s.phone || s.mobile || ''),
        this.escapeCsvValue(s.alt_phone || s.emergency_contact || ''),
        this.escapeCsvValue(s.gender || ''),
        this.escapeCsvValue(s.dob || s.date_of_birth || ''),
        this.escapeCsvValue(s.city || ''),
        this.escapeCsvValue(s.state || ''),
        this.escapeCsvValue(s.address || ''),
        this.escapeCsvValue(s.preferred_course || s.course || s.course_interested || ''),
        this.escapeCsvValue(s.preferred_university || s.university || s.target_university || ''),
        this.escapeCsvValue(s.target_country || s.country || 'India'),
        this.escapeCsvValue(s.budget || s.fee_budget || ''),
        this.escapeCsvValue(s.assigned_counsellor_name || s.counsellor_name || ''),
        this.escapeCsvValue(s.assigned_counsellor_id || s.counsellor_id || ''),
        this.escapeCsvValue(s.assigned_team_leader || s.team_leader_name || ''),
        this.escapeCsvValue(s.application_status || s.status || 'Active'),
        this.escapeCsvValue(s.lead_stage || s.stage || 'Enrolled'),
        this.escapeCsvValue(s.created_at || new Date().toISOString()),
        this.escapeCsvValue(s.updated_at || new Date().toISOString())
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const fileName = 'EduVision_Master_Students_Database.csv';

    return await this._saveCsvToDriveFolder(fileName, csvContent, studentsFolderId, { totalStudents: (studentsList || []).length });
  }

  /**
   * 2. Sync Master Staff & Employee Directory Spreadsheet in Google Drive (KYC & Aadhar)
   */
  async syncStaffSpreadsheet(staffList) {
    const rootFolderId = await this.getRootHubFolder();
    const staffFolderId = await this.getOrCreateFolder('Staff', rootFolderId);

    const headers = [
      'Employee ID', 'Full Name', 'Email', 'Phone Number', 'Staff Type',
      'Role / Designation', 'Branch / Campus', 'Account Status',
      'KYC Document / Aadhar Ref', 'Residential Address', 'Created Date', 'Last Updated'
    ];

    const rows = [headers.join(',')];
    (staffList || []).forEach(s => {
      const row = [
        this.escapeCsvValue(s.employee_id || s.counsellor_id || s.team_leader_id || s.admin_id || s.partner_code || s.id || ''),
        this.escapeCsvValue(s.full_name || s.name || s.contact_person || ''),
        this.escapeCsvValue(s.email || ''),
        this.escapeCsvValue(s.phone || s.contact_number || ''),
        this.escapeCsvValue(s.staff_type || s.type || 'Staff'),
        this.escapeCsvValue(s.role || s.designation || 'Staff'),
        this.escapeCsvValue(s.branch || s.location || 'Head Office'),
        this.escapeCsvValue(s.status || 'Active'),
        this.escapeCsvValue(s.aadhar_no || s.aadhar_number || s.kyc_doc || s.id_proof || 'Verified (On File)'),
        this.escapeCsvValue(s.address || ''),
        this.escapeCsvValue(s.created_at || new Date().toISOString()),
        this.escapeCsvValue(s.updated_at || new Date().toISOString())
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const fileName = 'EduVision_Staff_Directory_KYC.csv';

    return await this._saveCsvToDriveFolder(fileName, csvContent, staffFolderId, { totalStaff: (staffList || []).length });
  }

  /**
   * 3. Sync Master Attendance Spreadsheet in Google Drive
   */
  async syncAttendanceSpreadsheet(attendanceList) {
    const rootFolderId = await this.getRootHubFolder();
    const attFolderId = await this.getOrCreateFolder('Attendance', rootFolderId);

    const headers = [
      'Attendance Date', 'Employee ID', 'Employee Name', 'Role', 'Branch',
      'Clock In Time', 'Clock Out Time', 'Total Working Hours',
      'Attendance Status', 'Punch Location / IP', 'Remarks / Late Reason', 'Created At'
    ];

    const rows = [headers.join(',')];
    (attendanceList || []).forEach(a => {
      const row = [
        this.escapeCsvValue(a.date || a.attendance_date || ''),
        this.escapeCsvValue(a.employee_id || a.staff_id || ''),
        this.escapeCsvValue(a.full_name || a.employee_name || a.name || ''),
        this.escapeCsvValue(a.role || a.staff_role || 'Staff'),
        this.escapeCsvValue(a.branch || 'Head Office'),
        this.escapeCsvValue(a.clock_in || a.punch_in || a.clock_in_time || ''),
        this.escapeCsvValue(a.clock_out || a.punch_out || a.clock_out_time || ''),
        this.escapeCsvValue(a.total_hours || a.work_hours || ''),
        this.escapeCsvValue(a.status || a.attendance_status || 'Present'),
        this.escapeCsvValue(a.location || a.ip_address || ''),
        this.escapeCsvValue(a.remarks || a.notes || ''),
        this.escapeCsvValue(a.created_at || new Date().toISOString())
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const fileName = 'EduVision_Staff_Attendance_Master.csv';

    return await this._saveCsvToDriveFolder(fileName, csvContent, attFolderId, { totalRecords: (attendanceList || []).length });
  }

  /**
   * 4. Sync Call Recordings Logs Spreadsheet in Google Drive
   */
  async syncCallLogsSpreadsheet(callLogsList) {
    const rootFolderId = await this.getRootHubFolder();
    const callLogsFolderId = await this.getOrCreateFolder('Call-Logs', rootFolderId);

    const headers = [
      'Call Log ID', 'Student / Lead ID', 'Counsellor ID', 'Employee ID',
      'Phone Number', 'Call Type', 'Call Status', 'Duration (Seconds)',
      'Storage Provider', 'Drive Stream Link', 'Remarks', 'Called Timestamp'
    ];

    const rows = [headers.join(',')];
    (callLogsList || []).forEach(c => {
      const row = [
        this.escapeCsvValue(c.call_id || c.id || ''),
        this.escapeCsvValue(c.lead_id || c.student_id || ''),
        this.escapeCsvValue(c.counsellor_id || ''),
        this.escapeCsvValue(c.employee_id || ''),
        this.escapeCsvValue(c.phone_number || c.phone || ''),
        this.escapeCsvValue(c.call_type || 'Counselling'),
        this.escapeCsvValue(c.call_status || 'Completed'),
        this.escapeCsvValue(c.call_duration_seconds || c.duration || '0'),
        this.escapeCsvValue(c.storage_provider || 'Google Drive'),
        this.escapeCsvValue(c.drive_file_url || c.stream_url || ''),
        this.escapeCsvValue(c.remarks || ''),
        this.escapeCsvValue(c.called_at || c.created_at || new Date().toISOString())
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const fileName = 'EduVision_Call_Recordings_Logs.csv';

    return await this._saveCsvToDriveFolder(fileName, csvContent, callLogsFolderId, { totalLogs: (callLogsList || []).length });
  }

  /**
   * 5. Sync Leads CRM Pipeline Spreadsheet in Google Drive
   */
  async syncLeadsSpreadsheet(leadsList) {
    const rootFolderId = await this.getRootHubFolder();
    const leadsFolderId = await this.getOrCreateFolder('Leads', rootFolderId);

    const headers = [
      'Lead ID', 'Student Name', 'Phone Number', 'Email', 'Target Course',
      'Target University', 'Lead Stage', 'Assigned Counsellor', 'Lead Source',
      'City / State', 'Followup Date', 'Notes & Remarks', 'Created Date'
    ];

    const rows = [headers.join(',')];
    (leadsList || []).forEach(l => {
      const row = [
        this.escapeCsvValue(l.lead_id || l.id || ''),
        this.escapeCsvValue(l.full_name || l.name || ''),
        this.escapeCsvValue(l.phone || l.mobile || ''),
        this.escapeCsvValue(l.email || ''),
        this.escapeCsvValue(l.course || l.preferred_course || ''),
        this.escapeCsvValue(l.university || l.target_university || ''),
        this.escapeCsvValue(l.stage || l.lead_stage || 'New'),
        this.escapeCsvValue(l.counsellor_name || l.assigned_to || ''),
        this.escapeCsvValue(l.source || l.lead_source || 'Website'),
        this.escapeCsvValue(l.city || l.location || ''),
        this.escapeCsvValue(l.next_followup || l.followup_date || ''),
        this.escapeCsvValue(l.notes || l.remarks || ''),
        this.escapeCsvValue(l.created_at || new Date().toISOString())
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const fileName = 'EduVision_Leads_CRM_Pipeline.csv';

    return await this._saveCsvToDriveFolder(fileName, csvContent, leadsFolderId, { totalLeads: (leadsList || []).length });
  }

  /**
   * Lazily resolves or creates folder hierarchy for Staff & Employee KYC documents
   */
  async resolveStaffKycFolder(employeeId, employeeName) {
    try {
      const safeName = this.sanitizeName(employeeName || 'Staff');
      const safeId = this.sanitizeName(employeeId || 'EMP');
      const staffFolderName = `${safeId}_${safeName}`;

      const eduvisionRootId = await this.getRootHubFolder();
      const staffKycRootId = await this.getOrCreateFolder('Staff-KYC-Dossiers', eduvisionRootId);
      const staffFolderId = await this.getOrCreateFolder(staffFolderName, staffKycRootId);

      return { staffKycRootId, staffFolderId };
    } catch(err) {
      console.warn('[Drive] Staff KYC folder resolution fallback:', err.message);
      return { staffKycRootId: null, staffFolderId: null };
    }
  }

  /**
   * Upload Staff KYC Document (Aadhaar, PAN, Passport, Bank Proof) directly to Google Drive
   */
  async uploadStaffKycDocument({ fileBuffer, fileName, mimeType, employeeId, employeeName, docType }) {
    const { staffKycRootId, staffFolderId } = await this.resolveStaffKycFolder(employeeId, employeeName);

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const safeDocType = this.sanitizeName(docType || 'ID_Proof').toUpperCase();
    const cleanFileName = fileName || `${safeDocType}_${employeeId}.pdf`;

    const fileMetadata = {
      name: cleanFileName,
      parents: staffFolderId ? [staffFolderId] : (staffKycRootId ? [staffKycRootId] : [])
    };

    const media = {
      mimeType: mimeType || 'application/pdf',
      body: bufferStream
    };

    const res = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink, size, mimeType'
    });

    try {
      await this.drive.permissions.create({
        fileId: res.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });
    } catch(permErr) {
      console.warn('[Drive] Staff KYC permission note:', permErr.message);
    }

    const driveDirectLink = `https://drive.google.com/file/d/${res.data.id}/view`;

    return {
      fileId: res.data.id,
      fileName: res.data.name,
      fileSize: res.data.size,
      mimeType: res.data.mimeType,
      docType: docType,
      employeeId: employeeId,
      employeeName: employeeName,
      folderId: staffFolderId,
      webViewLink: res.data.webViewLink || driveDirectLink,
      webContentLink: res.data.webContentLink || driveDirectLink,
      driveFileUrl: driveDirectLink,
      storageProvider: 'google_drive'
    };
  }

  /**
   * Delete file
   */
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch(err) {
      console.warn('[Drive] Delete file notice:', err.message);
      return false;
    }
  }
}

module.exports = GoogleDriveStorageProvider;
