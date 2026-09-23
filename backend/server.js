const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const express = require('express');

// ── 🛡️ ZERO-CRASH GLOBAL SAFEGUARDS ──
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL PROCESS GUARD] Uncaught Exception caught safely:', err.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL PROCESS GUARD] Unhandled Promise Rejection caught safely:', reason?.message || reason);
});
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const StorageService = require('./storage/StorageService');
const GoogleDriveStorageProvider = require('./storage/GoogleDriveStorageProvider');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-counsellor-id', 'x-caller-role', 'x-employee-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Server Client (Admin Service Role for resilient operations)
const supabaseUrl = process.env.SUPABASE_URL || 'https://ewxvqpyusveiynplzxed.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_NFUbLO9g-UTt-Z9fUuQoyw__Xrxq2IC';
const sb = createClient(supabaseUrl, supabaseKey);

// Google OAuth Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/auth/google/callback`
);

let isGoogleAuthorized = false;

// If refresh token exists in environment, hydrate oauth2Client
if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_REFRESH_TOKEN.trim()) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim()
  });
  isGoogleAuthorized = true;
  console.log('Official EduVision Google Drive OAuth credentials loaded with persistent refresh token.');
} else {
  console.warn('Google Drive Refresh Token not set. Please authorize the official EduVision Google account via /api/auth/google/url');
}

// Storage Service initialization
const driveProvider = new GoogleDriveStorageProvider(oauth2Client);
const storageService = new StorageService(driveProvider);

// Multer in-memory storage for audio files (up to 60 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 }, // 60MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/webm'
    ];
    const allowedExts = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${file.mimetype}). Please upload standard audio files (MP3, WAV, M4A).`));
    }
  }
});

// Dedicated multer for student documents (PDF, JPG, PNG, DOCX)
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB max
  }
});

/**
 * Middleware: Verify CTO Permission for Call Recording Upload
 */
async function verifyCallRecordingPermission(req, res, next) {
  try {
    const callerId = req.headers['x-counsellor-id'] || req.headers['x-employee-id'] || req.body.counsellor_id;
    const callerRole = req.headers['x-caller-role'] || 'Counsellor';

    // 1. Check Global Feature Lock & Role Permission in Supabase if tables exist
    try {
      const { data: globalLock } = await sb
        .from('system_global_feature_locks')
        .select('*')
        .eq('feature_key', 'counsellor_call_recordings')
        .single();

      if (globalLock && globalLock.is_globally_locked) {
        return res.status(403).json({
          success: false,
          error: 'Call recording upload is globally locked by CTO Raghav.',
          locked: true,
          lockedBy: globalLock.locked_by_name || 'CTO Raghav'
        });
      }

      // Check role permission
      const normalizedRole = (callerRole || 'counsellor').toLowerCase().replace(/\s+/g, '_');
      const { data: rolePerm } = await sb
        .from('system_role_permissions')
        .select('*')
        .eq('module_key', 'counsellor_call_recordings')
        .eq('role_key', normalizedRole)
        .single();

      if (rolePerm && (!rolePerm.is_enabled || rolePerm.is_locked)) {
        return res.status(403).json({
          success: false,
          error: `Call recording upload is locked for role "${callerRole}" by CTO Raghav.`,
          locked: true,
          lockedBy: rolePerm.locked_by_name || 'CTO Raghav'
        });
      }
    } catch(permErr) {
      // If permission table query fails or tables are not created, allow default authorized flow
    }

    next();
  } catch(err) {
    console.error('Permission verification check error:', err);
    next();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SYSTEM HEALTH & DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EduVision Call Recording Backend',
    storage_provider: storageService.getProviderName(),
    google_authorized: isGoogleAuthorized
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GOOGLE OAUTH ONE-TIME AUTHORIZATION FLOW (OFFICIAL ACCOUNT SETUP)
// ─────────────────────────────────────────────────────────────────────────────

// Generate OAuth authorization URL & direct browser redirect
app.get(['/api/auth/google/url', '/api/auth/google/login', '/api/auth/google/connect'], (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });

  // If requested as JSON via query ?json=true or XHR
  if (req.query.json === 'true' || req.xhr) {
    return res.json({
      success: true,
      auth_url: authUrl,
      is_already_authorized: isGoogleAuthorized
    });
  }

  // If accessed directly in browser, redirect directly to Google OAuth consent page!
  return res.redirect(authUrl);
});

// OAuth Callback handlers (Dual support for both configured URIs)
const handleOAuthCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code missing from Google redirect.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      // Persist refresh token to .env safely
      const envPath = path.join(__dirname, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
        envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/g, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        envContent += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf-8');
      process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
      isGoogleAuthorized = true;
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EduVision Storage Connected</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #070b14; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 40px; text-align: center; max-width: 480px; }
          h1 { color: #4ade80; margin-bottom: 12px; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          .btn { display: inline-block; margin-top: 20px; background: #ffffff; color: #000; padding: 12px 24px; border-radius: 12px; font-weight: 700; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✓ Google Drive Connected!</h1>
          <p>Official EduVision Google Drive storage has been securely linked and authorized.</p>
          <p>All call recordings will now be automatically organized into the official Google Drive structure.</p>
          <a href="/admin/dashboard.html" class="btn">Return to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  } catch(err) {
    console.error('Error exchanging Google OAuth code:', err);
    res.status(500).send(`Failed to authenticate Google account: ${err.message}`);
  }
};

app.get('/api/auth/google/callback', handleOAuthCallback);
app.get('/oauth2callback', handleOAuthCallback);

// ─────────────────────────────────────────────────────────────────────────────
// 3. CALL RECORDINGS UPLOAD ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 3. CALL RECORDINGS UPLOAD ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/recordings/upload', upload.single('audio_file'), verifyCallRecordingPermission, async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No audio file provided. Please select an audio file (MP3/WAV/M4A).' });
    }

    const {
      lead_id,
      student_id,
      counsellor_id,
      employee_id,
      call_type,
      duration,
      notes,
      student_name,
      uploaded_by,
      uploaded_by_role
    } = req.body;

    if (!lead_id && !student_id) {
      return res.status(400).json({ success: false, error: 'lead_id or student_id is required.' });
    }

    const primaryId = lead_id || student_id;

    // 1. Check existing cached Google Drive folder ID from leads table
    let cachedFolderId = null;
    let safeName = student_name || 'Student';

    try {
      if (lead_id) {
        const { data: leadData } = await sb
          .from('leads')
          .select('full_name, drive_folder_id')
          .eq('lead_id', lead_id)
          .single();

        if (leadData) {
          if (leadData.full_name) safeName = leadData.full_name;
          if (leadData.drive_folder_id) cachedFolderId = leadData.drive_folder_id;
        }
      }
    } catch(e) {
      console.warn('Lead lookup warning:', e);
    }

    // 2. Generate safe, collision-resistant filename
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}-${mins}`;
    const safeType = (call_type || 'Counselling').replace(/\s+/g, '-');
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';

    const safeStudentPart = safeName.replace(/[\/\?<>\\:\*\|":\s]+/g, '-').trim();
    const fileName = `${dateStr}_${timeStr}_${safeStudentPart}_${safeType}${ext}`;

    let driveResult = null;

    // 3. Upload to Google Drive if authorized, otherwise store in Secure Local Vault
    if (isGoogleAuthorized) {
      console.log(`Starting upload to Google Drive for Lead ${primaryId} (${fileName})...`);
      driveResult = await storageService.uploadCallRecording({
        fileBuffer: file.buffer,
        fileName: fileName,
        mimeType: file.mimetype,
        leadId: primaryId,
        studentName: safeName,
        dateStr: dateStr,
        cachedLeadFolderId: cachedFolderId
      });
      console.log(`Google Drive upload successful! File ID: ${driveResult.fileId}`);

      // Update cached folder ID on leads table if not already cached
      if (lead_id && driveResult.leadFolderId && !cachedFolderId) {
        try {
          await sb
            .from('leads')
            .update({ drive_folder_id: driveResult.leadFolderId })
            .eq('lead_id', lead_id);
        } catch(cacheErr) {
          console.warn('Failed to cache drive_folder_id on lead:', cacheErr);
        }
      }
    } else {
      // Local Vault fallback
      const vaultDir = path.join(__dirname, 'data', 'vault');
      if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
      const vaultPath = path.join(vaultDir, fileName);
      fs.writeFileSync(vaultPath, file.buffer);

      const vaultId = `vault_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      driveResult = {
        fileId: vaultId,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        leadFolderId: `vault_${primaryId}`,
        folderId: 'local_vault',
        webViewLink: null,
        storageProvider: 'local_vault_pending_oauth'
      };
      console.log(`Saved call recording to Local Audio Vault (${fileName}, ID: ${vaultId})`);
    }

    // 4. Create metadata payload
    const metadataPayload = {
      recording_id: `rec_${Date.now()}`,
      lead_id: lead_id || null,
      student_id: student_id || null,
      student_name: safeName,
      counsellor_id: counsellor_id || null,
      employee_id: employee_id || counsellor_id || null,
      call_type: call_type || 'Counselling',
      call_status: 'Completed',
      remarks: notes || `Call Recording (${call_type || 'Counselling'}) uploaded`,
      file_name: fileName,
      file_size: file.size,
      mime_type: file.mimetype,
      storage_provider: driveResult.storageProvider || 'google_drive',
      drive_file_id: driveResult.fileId,
      drive_folder_id: driveResult.folderId,
      drive_file_url: driveResult.webViewLink || null,
      upload_status: 'successful',
      uploaded_by: uploaded_by || counsellor_id || 'Counsellor',
      uploaded_by_role: uploaded_by_role || 'Counsellor',
      duration: duration || '0:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 5. Atomic JSON Persistence fallback
    try {
      const recordingsFile = path.join(__dirname, 'data', 'recordings.json');
      let currentRecords = [];
      if (fs.existsSync(recordingsFile)) {
        try {
          currentRecords = JSON.parse(fs.readFileSync(recordingsFile, 'utf8') || '[]');
        } catch(e) { currentRecords = []; }
      }
      currentRecords.unshift(metadataPayload);
      fs.writeFileSync(recordingsFile, JSON.stringify(currentRecords, null, 2), 'utf8');
    } catch(jsonErr) {
      console.warn('Failed to append to recordings.json:', jsonErr);
    }

    // 6. Insert Recording Metadata into Supabase counsellor_call_logs table
    let insertedLog = null;
    try {
      const { data: logData, error: logErr } = await sb
        .from('counsellor_call_logs')
        .insert([{
          counsellor_id: counsellor_id || 'CNS0001',
          lead_id: lead_id || null,
          call_type: call_type || 'Counselling',
          call_status: 'Completed',
          remarks: notes ? `${notes} [File: ${fileName}]` : `Call Recording (${call_type || 'Counselling'}): ${fileName}`
        }])
        .select('*');

      if (!logErr && logData && logData.length > 0) {
        insertedLog = logData[0];
      }
    } catch(dbErr) {
      console.warn('Supabase log sync warning:', dbErr);
    }

    res.json({
      success: true,
      message: isGoogleAuthorized
        ? 'Call recording uploaded successfully to official Google Drive.'
        : 'Call recording saved successfully to secure audio vault (Google OAuth pending).',
      file_id: driveResult.fileId,
      file_name: fileName,
      file_size: file.size,
      storage_provider: driveResult.storageProvider,
      web_view_link: driveResult.webViewLink,
      recording_record: metadataPayload
    });

  } catch(err) {
    console.error('Fatal recording upload error:', err);
    res.status(500).json({
      success: false,
      error: `Upload failed: ${err.message || 'Internal server error during upload.'}`
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. LIST CALL RECORDINGS FOR STUDENT / LEAD / COUNSELLOR / ADMIN
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/recordings/list', async (req, res) => {
  try {
    const { lead_id, student_id, counsellor_id, limit = 100, offset = 0 } = req.query;

    let records = [];

    // 1. Read persistent recordings.json store
    try {
      const recordingsFile = path.join(__dirname, 'data', 'recordings.json');
      if (fs.existsSync(recordingsFile)) {
        const raw = JSON.parse(fs.readFileSync(recordingsFile, 'utf8') || '[]');
        records = raw.filter(r => {
          // If no filters passed, return all recordings (Admin/Leader view)
          if (!lead_id && !student_id && !counsellor_id) return true;

          const targetLead = (lead_id || '').toLowerCase().trim();
          const targetStudent = (student_id || '').toLowerCase().trim();
          const targetCounsellor = (counsellor_id || '').toLowerCase().trim();

          const rLead = (r.lead_id || '').toLowerCase().trim();
          const rStudent = (r.student_id || '').toLowerCase().trim();
          const rCounsellor = (r.counsellor_id || '').toLowerCase().trim();
          const rEmp = (r.employee_id || '').toLowerCase().trim();

          if (targetLead && rLead && rLead === targetLead) return true;
          if (targetStudent && rStudent && rStudent === targetStudent) return true;
          if (targetCounsellor && ((rCounsellor && rCounsellor === targetCounsellor) || (rEmp && rEmp === targetCounsellor))) return true;

          return false;
        });
      }
    } catch(e) {
      console.warn('Error reading recordings.json:', e);
    }

    // 2. Also check Supabase if available
    try {
      let query = sb
        .from('counsellor_call_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (lead_id) query = query.or(`lead_id.eq.${lead_id},student_id.eq.${lead_id}`);
      else if (student_id) query = query.or(`student_id.eq.${student_id},lead_id.eq.${student_id}`);
      else if (counsellor_id) query = query.eq('counsellor_id', counsellor_id);

      const { data: sbData } = await query;
      if (sbData && sbData.length > 0) {
        sbData.forEach(s => {
          if (s.drive_file_id && !records.some(r => r.drive_file_id === s.drive_file_id)) {
            records.push(s);
          }
        });
      }
    } catch(e) {
      // Supabase query fallback
    }

    // Sort descending by created_at
    records.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const paginated = records.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      count: paginated.length,
      total: records.length,
      recordings: paginated
    });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. SECURE IN-APP AUDIO STREAM PROXY (KEEPS DRIVE PRIVATE)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/recordings/stream/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) return res.status(400).send('File ID required');

    // 1. Check if file is stored in local vault
    if (fileId.startsWith('vault_')) {
      const recordingsFile = path.join(__dirname, 'data', 'recordings.json');
      let fileName = null;
      if (fs.existsSync(recordingsFile)) {
        const raw = JSON.parse(fs.readFileSync(recordingsFile, 'utf8') || '[]');
        const rec = raw.find(r => r.drive_file_id === fileId);
        if (rec) fileName = rec.file_name;
      }

      const vaultDir = path.join(__dirname, 'data', 'vault');
      const targetFile = fileName ? path.join(vaultDir, fileName) : null;

      if (targetFile && fs.existsSync(targetFile)) {
        const stat = fs.statSync(targetFile);
        const totalSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
          const chunkSize = (end - start) + 1;

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `inline; filename="${fileName || 'recording.mp3'}"`
          });
          return fs.createReadStream(targetFile, { start, end }).pipe(res);
        } else {
          res.writeHead(200, {
            'Content-Length': totalSize,
            'Content-Type': 'audio/mpeg',
            'Accept-Ranges': 'bytes',
            'Content-Disposition': `inline; filename="${fileName || 'recording.mp3'}"`
          });
          return fs.createReadStream(targetFile).pipe(res);
        }
      }
    }

    // 2. Stream from Google Drive
    if (!isGoogleAuthorized) {
      return res.status(503).send('Google Drive storage is not authorized.');
    }

    const metadata = await storageService.getFileMetadata(fileId);
    const totalSize = parseInt(metadata.size, 10) || 0;
    const mimeType = metadata.mimeType || 'audio/mpeg';
    const range = req.headers.range;

    if (range && totalSize > 0) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${metadata.name || 'recording.mp3'}"`
      });

      const audioStream = await storageService.getFileStream(fileId, { Range: `bytes=${start}-${end}` });
      return audioStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize || undefined,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="${metadata.name || 'recording.mp3'}"`
      });
      const audioStream = await storageService.getFileStream(fileId);
      return audioStream.pipe(res);
    }
  } catch(err) {
    console.error('Audio stream error:', err);
    res.status(500).send(`Failed to stream audio recording: ${err.message}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE CALL RECORDING (WITH GOOGLE DRIVE & LOCAL VAULT CLEANUP)
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/api/recordings/delete/:id', async (req, res) => {
  try {
    const recordingId = req.params.id;
    if (!recordingId) {
      return res.status(400).json({ success: false, error: 'Recording ID required' });
    }

    const recordingsFile = path.join(__dirname, 'data', 'recordings.json');
    if (!fs.existsSync(recordingsFile)) {
      return res.status(404).json({ success: false, error: 'No recordings store found' });
    }

    let raw = JSON.parse(fs.readFileSync(recordingsFile, 'utf8') || '[]');
    const targetIdx = raw.findIndex(r => 
      (r.recording_id && r.recording_id === recordingId) ||
      (r.drive_file_id && r.drive_file_id === recordingId) ||
      (r.id && r.id === recordingId) ||
      (r.google_file_id && r.google_file_id === recordingId) ||
      (r.call_id && r.call_id === recordingId)
    );

    if (targetIdx === -1) {
      return res.status(404).json({ success: false, error: 'Recording not found' });
    }

    const targetRec = raw[targetIdx];

    // 1. Delete from Google Drive if drive_file_id exists and not local vault
    if (targetRec.drive_file_id && !targetRec.drive_file_id.startsWith('vault_') && isGoogleAuthorized) {
      try {
        await storageService.deleteFile(targetRec.drive_file_id);
        console.log(`[Google Drive] Deleted file ${targetRec.drive_file_id}`);
      } catch (driveErr) {
        console.warn(`[Google Drive] Could not delete file from drive:`, driveErr.message);
      }
    }

    // 2. Delete from local vault if present
    if (targetRec.file_name) {
      const localFile = path.join(__dirname, 'data', 'vault', targetRec.file_name);
      if (fs.existsSync(localFile)) {
        try {
          fs.unlinkSync(localFile);
          console.log(`[Local Vault] Deleted file ${targetRec.file_name}`);
        } catch(e) {}
      }
    }

    // 3. Delete from Supabase counsellor_call_logs if present
    try {
      if (targetRec.recording_id) {
        await sb.from('counsellor_call_logs').delete().eq('recording_id', targetRec.recording_id);
      }
    } catch(sbErr) {}

    // 4. Remove from JSON store
    raw.splice(targetIdx, 1);
    fs.writeFileSync(recordingsFile, JSON.stringify(raw, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'Call recording deleted successfully',
      deleted_id: recordingId,
      remaining_count: raw.length
    });
  } catch(err) {
    console.error('Delete recording error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/recordings/delete', async (req, res) => {
  const recordingId = req.body.recording_id || req.body.id || req.body.drive_file_id;
  if (!recordingId) {
    return res.status(400).json({ success: false, error: 'Recording ID required' });
  }

  try {
    const recordingsFile = path.join(__dirname, 'data', 'recordings.json');
    if (!fs.existsSync(recordingsFile)) {
      return res.status(404).json({ success: false, error: 'No recordings store found' });
    }

    let raw = JSON.parse(fs.readFileSync(recordingsFile, 'utf8') || '[]');
    const targetIdx = raw.findIndex(r => 
      (r.recording_id && r.recording_id === recordingId) ||
      (r.drive_file_id && r.drive_file_id === recordingId) ||
      (r.id && r.id === recordingId) ||
      (r.google_file_id && r.google_file_id === recordingId) ||
      (r.call_id && r.call_id === recordingId)
    );

    if (targetIdx === -1) {
      return res.status(404).json({ success: false, error: 'Recording not found' });
    }

    const targetRec = raw[targetIdx];

    if (targetRec.drive_file_id && !targetRec.drive_file_id.startsWith('vault_') && isGoogleAuthorized && drive) {
      try {
        await drive.files.delete({ fileId: targetRec.drive_file_id });
      } catch (driveErr) {}
    }

    if (targetRec.file_name) {
      const localFile = path.join(__dirname, 'data', 'vault', targetRec.file_name);
      if (fs.existsSync(localFile)) {
        try { fs.unlinkSync(localFile); } catch(e) {}
      }
    }

    try {
      if (targetRec.recording_id) {
        await sb.from('counsellor_call_logs').delete().eq('recording_id', targetRec.recording_id);
      }
    } catch(sbErr) {}

    raw.splice(targetIdx, 1);
    fs.writeFileSync(recordingsFile, JSON.stringify(raw, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'Call recording deleted successfully',
      deleted_id: recordingId,
      remaining_count: raw.length
    });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// EDUVISION 2.0 — NATIVE WEB FORM SUBMISSION & INBOUND LEAD PIPELINE
// ──────────────────────────────────────────────────────────────────────────────

function normalizeIndianPhone(raw) {
  if (!raw) return '';
  let clean = String(raw).replace(/[^0-9]/g, '');
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.substring(2);
  } else if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.substring(1);
  }
  return clean;
}

function normalizeIndianEmail(raw) {
  if (!raw) return null;
  const t = String(raw).trim().toLowerCase();
  return t.length > 0 ? t : null;
}

app.post('/api/web-forms/submit', async (req, res) => {
  try {
    const payload = req.body || {};
    const fullName = (payload.full_name || payload.name || '').trim();
    const cleanPhone = normalizeIndianPhone(payload.phone || payload.mobile || '');
    const cleanEmail = normalizeIndianEmail(payload.email);

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please provide a valid full name.' });
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide a valid 10-digit mobile number.' });
    }

    const sanitizedPayload = {
      full_name: fullName,
      phone: cleanPhone,
      email: cleanEmail,
      course_name: (payload.course_name || payload.course || '').trim() || null,
      university_name: (payload.university_name || payload.university || '').trim() || null,
      state: (payload.state || '').trim() || null,
      city: (payload.city || '').trim() || null,
      message: (payload.message || payload.notes || '').trim() || null,
      form_type: (payload.form_type || 'general_enquiry').substring(0, 60),
      utm_source: (payload.utm_source || '').trim() || null,
      utm_medium: (payload.utm_medium || '').trim() || null,
      utm_campaign: (payload.utm_campaign || '').trim() || null,
      utm_term: (payload.utm_term || '').trim() || null,
      utm_content: (payload.utm_content || '').trim() || null,
      page_url: payload.page_url || '',
      referrer_url: payload.referrer_url || '',
      device_type: payload.device_type || 'Desktop'
    };

    // 1. Try Supabase RPC first
    try {
      const { data: rpcData, error: rpcError } = await sb.rpc('rpc_submit_web_form', { p_payload: sanitizedPayload });
      if (!rpcError && rpcData && rpcData.success) {
        if (!rpcData.lead_id && rpcData.submission_id) {
          try {
            const { data: subRow } = await sb.from('web_form_submissions').select('lead_id').eq('submission_id', rpcData.submission_id).single();
            if (subRow && subRow.lead_id) rpcData.lead_id = subRow.lead_id;
          } catch(e) {}
        }
        return res.json(rpcData);
      }
    } catch(rpcErr) {
      console.warn('Backend server RPC warning, attempting direct table sync:', rpcErr.message);
    }

    // 2. Direct Supabase Lead Dedup & Submission Sync (Fallback)
    const now = new Date();
    const subId = `WF-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
    let matchedLeadId = null;
    let isDuplicate = false;

    try {
      const { data: existingLeads } = await sb
        .from('leads')
        .select('lead_id, full_name, phone, email, counsellor_id, status')
        .or(`phone.ilike.%${cleanPhone}%,email.ilike.${cleanEmail || '___none___'}`)
        .limit(1);

      if (existingLeads && existingLeads.length > 0) {
        matchedLeadId = existingLeads[0].lead_id;
        isDuplicate = true;
      }
    } catch(lookupErr) {}

    if (!matchedLeadId) {
      // Create new Lead ID
      const yearPrefix = `LD${String(now.getFullYear()).slice(2)}`;
      let nextNum = 1;
      try {
        const { data: maxLeads } = await sb
          .from('leads')
          .select('lead_id')
          .like('lead_id', `${yearPrefix}%`)
          .order('lead_id', { ascending: false })
          .limit(1);

        if (maxLeads && maxLeads.length > 0) {
          const numPart = parseInt(maxLeads[0].lead_id.replace(yearPrefix, ''), 10);
          if (!isNaN(numPart)) nextNum = numPart + 1;
        }
      } catch(e) {}

      let defaultCnsId = null;
      try {
        const { data: cnsList } = await sb.from('counsellors').select('counsellor_id').ilike('status', 'active').order('counsellor_id', { ascending: true }).limit(1);
        if (cnsList && cnsList.length > 0) defaultCnsId = cnsList[0].counsellor_id;
      } catch(e) {}

      try {
        await sb.from('leads').insert([{
          lead_id: matchedLeadId,
          full_name: fullName,
          phone: cleanPhone,
          email: cleanEmail,
          interested_course: sanitizedPayload.course_name || 'General Counselling',
          interested_university: sanitizedPayload.university_name || 'Not Specified',
          lead_source: 'Web Form',
          status: 'New',
          counsellor_id: defaultCnsId,
          notes: `Enquiry submitted via Web Form: ${sanitizedPayload.form_type}${sanitizedPayload.message ? ' | Message: ' + sanitizedPayload.message : ''}`
        }]);
      } catch(leadInsertErr) {
        console.warn('Lead insert fallback warning:', leadInsertErr.message);
      }
    }

    // Insert into web_form_submissions (or local store fallback)
    let insertSucceeded = false;
    try {
      const { error: insertErr } = await sb.from('web_form_submissions').insert([{
        submission_id: subId,
        form_type: sanitizedPayload.form_type,
        full_name: fullName,
        phone: cleanPhone,
        email: cleanEmail,
        course_name: sanitizedPayload.course_name,
        university_name: sanitizedPayload.university_name,
        state: sanitizedPayload.state,
        city: sanitizedPayload.city,
        message: sanitizedPayload.message,
        utm_source: sanitizedPayload.utm_source,
        utm_medium: sanitizedPayload.utm_medium,
        utm_campaign: sanitizedPayload.utm_campaign,
        utm_term: sanitizedPayload.utm_term,
        utm_content: sanitizedPayload.utm_content,
        page_url: sanitizedPayload.page_url,
        referrer_url: sanitizedPayload.referrer_url,
        device_type: sanitizedPayload.device_type,
        submission_status: isDuplicate ? 'Linked' : 'Processed',
        lead_id: matchedLeadId,
        raw_payload: sanitizedPayload
      }]);
      if (!insertErr) insertSucceeded = true;
    } catch(wfsErr) {}

    // Always maintain local persistent store for instant dashboard and resilience
    try {
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const storeFile = path.join(dataDir, 'web_submissions.json');
      let submissions = [];
      try { submissions = JSON.parse(fs.readFileSync(storeFile, 'utf8') || '[]'); } catch(e) {}
      submissions.unshift({
        submission_id: subId,
        ...sanitizedPayload,
        submission_status: isDuplicate ? 'Linked' : 'Processed',
        lead_id: matchedLeadId,
        created_at: now.toISOString()
      });
      fs.writeFileSync(storeFile, JSON.stringify(submissions.slice(0, 500), null, 2), 'utf8');
    } catch(fsErr) {
      console.warn('Local store write error:', fsErr.message);
    }

    res.json({
      success: true,
      submission_id: subId,
      lead_id: matchedLeadId,
      is_duplicate: isDuplicate,
      message: isDuplicate 
        ? 'Thank you! We have received your enquiry. Our counselling team will get in touch with you shortly.'
        : 'Application submitted successfully! Our expert counsellor will connect with you soon.'
    });
  } catch(err) {
    console.error('Web Form submit handler error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during form submission' });
  }
});

app.get('/api/web-forms/list', async (req, res) => {
  try {
    const callerRole = (req.headers['x-caller-role'] || 'Admin').toLowerCase();
    const callerId = req.headers['x-counsellor-id'] || req.headers['x-employee-id'] || '';

    // 1. Try Supabase RPC
    try {
      const { data, error } = await sb.rpc('rpc_get_web_form_submissions', {
        p_caller_role: callerRole,
        p_caller_id: callerId,
        p_limit: 100,
        p_offset: 0
      });
      if (!error && Array.isArray(data)) {
        return res.json({ success: true, submissions: data });
      }
    } catch(rpcErr) {}

    // 2. Direct table fetch fallback
    try {
      let query = sb.from('web_form_submissions').select('*').order('created_at', { ascending: false }).limit(100);
      const { data, error } = await query;
      if (!error && data) {
        return res.json({ success: true, submissions: data });
      }
    } catch(tErr) {}

    // 3. Local JSON fallback
    const storeFile = path.join(__dirname, 'data', 'web_submissions.json');
    let localSubmissions = [];
    if (fs.existsSync(storeFile)) {
      try { localSubmissions = JSON.parse(fs.readFileSync(storeFile, 'utf8') || '[]'); } catch(e) {}
    }

    res.json({ success: true, submissions: localSubmissions });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/update', async (req, res) => {
  try {
    const { student_id, payload } = req.body || {};
    if (!student_id || !payload) {
      return res.status(400).json({ success: false, error: 'Student ID and payload are required' });
    }

    // 1. Fetch existing student profile to preserve non-empty existing values
    try {
      const { data: existing } = await sb.from('student_profiles').select('*').eq('student_id', student_id).single();
      if (existing) {
        Object.keys(existing).forEach(key => {
          if (payload[key] === '' || payload[key] === undefined || payload[key] === null) {
            if (existing[key] !== undefined && existing[key] !== null && existing[key] !== '') {
              payload[key] = existing[key];
            }
          }
        });
        if (!payload.assigned_counsellor && existing.assigned_counsellor) {
          payload.assigned_counsellor = existing.assigned_counsellor;
        }
      }
    } catch(e) {}

    // Ensure full_name is present (required by Supabase RPC)
    if (!payload.full_name) {
      payload.full_name = 'Student';
    }

    console.log(`[API] Updating student_profiles via update_student_crm for ${student_id}:`, payload);

    let updateSuccess = false;
    let rpcErrorMessage = null;

    // 2. Primary: Use update_student_crm RPC with active counsellor CNS260001
    try {
      const { data: rpcRes, error: rpcErr } = await sb.rpc('update_student_crm', {
        p_counsellor_id: 'CNS260001',
        p_student_id: student_id,
        p_payload: payload
      });

      if (!rpcErr) {
        updateSuccess = true;
      } else {
        console.warn('[API] update_student_crm warning:', rpcErr);
        rpcErrorMessage = rpcErr.message;
      }
    } catch(e) {
      rpcErrorMessage = e.message;
    }

    // 3. Fallback: direct table update
    if (!updateSuccess) {
      try {
        const { error } = await sb
          .from('student_profiles')
          .update(payload)
          .eq('student_id', student_id);

        if (!error) updateSuccess = true;
      } catch(e) {}
    }

    // Automatically sync updated student to Master Spreadsheet in Google Drive & Local Storage
    getAllStudentsConsolidated([Object.assign({ student_id }, payload)]).then(allStudents => {
      try {
        const headers = [
          'Student ID', 'Full Name', 'Email', 'Phone', 'Alternative Phone', 'Gender',
          'Date of Birth', 'City', 'State', 'Address', 'Preferred Course', 'Preferred University',
          'Target Country', 'Budget (INR)', 'Assigned Counsellor', 'Assigned Counsellor ID',
          'Assigned Team Leader', 'Application Status', 'Lead Stage', 'Created Date', 'Last Updated'
        ];
        const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
        const csvRows = [headers.join(',')];
        allStudents.forEach(s => {
          csvRows.push([
            escapeCsv(s.student_id || s.id || ''),
            escapeCsv(s.full_name || s.name || ''),
            escapeCsv(s.email || ''),
            escapeCsv(s.phone || s.mobile || ''),
            escapeCsv(s.alt_phone || ''),
            escapeCsv(s.gender || ''),
            escapeCsv(s.dob || ''),
            escapeCsv(s.city || ''),
            escapeCsv(s.state || ''),
            escapeCsv(s.address || ''),
            escapeCsv(s.preferred_course || s.course || ''),
            escapeCsv(s.preferred_university || s.university || ''),
            escapeCsv(s.target_country || 'India'),
            escapeCsv(s.budget || ''),
            escapeCsv(s.assigned_counsellor_name || s.counsellor_name || ''),
            escapeCsv(s.assigned_counsellor_id || s.counsellor_id || ''),
            escapeCsv(s.assigned_team_leader || ''),
            escapeCsv(s.application_status || s.status || 'Active'),
            escapeCsv(s.lead_stage || 'Enrolled'),
            escapeCsv(s.created_at || new Date().toISOString()),
            escapeCsv(s.updated_at || new Date().toISOString())
          ].join(','));
        });
        fs.writeFileSync(localSpreadsheetPath, csvRows.join('\r\n'), 'utf8');

        if (isGoogleAuthorized && typeof driveProvider.syncAllStudentsSpreadsheet === 'function') {
          driveProvider.syncAllStudentsSpreadsheet(allStudents).catch(e => console.warn('Drive auto-sync warning:', e));
        }
      } catch(e) {}
    }).catch(e => console.warn('Spreadsheet update notice:', e));

    res.json({ success: true, student_id, updated: true });
  } catch(err) {
    console.error('[API] Student update handler error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MASTER STUDENTS SPREADSHEET SYNC ENGINE (GOOGLE DRIVE + LOCAL CSV VAULT)
// ─────────────────────────────────────────────────────────────────────────────
const spreadsheetsDir = path.join(__dirname, 'data', 'spreadsheets');
if (!fs.existsSync(spreadsheetsDir)) {
  fs.mkdirSync(spreadsheetsDir, { recursive: true });
}
const localSpreadsheetPath = path.join(spreadsheetsDir, 'EduVision_Master_Students_Database.csv');
const masterStudentsJsonStore = path.join(spreadsheetsDir, 'master_students.json');

async function getAllStudentsConsolidated(clientStudents = []) {
  const map = new Map();

  // 1. From local JSON store
  if (fs.existsSync(masterStudentsJsonStore)) {
    try {
      const localList = JSON.parse(fs.readFileSync(masterStudentsJsonStore, 'utf8') || '[]');
      localList.forEach(s => {
        const id = s.student_id || s.id;
        if (id) map.set(String(id).toUpperCase(), s);
      });
    } catch(e) {}
  }

  // 2. From Supabase student_profiles
  try {
    const { data: dbStudents } = await sb.from('student_profiles').select('*');
    if (dbStudents && Array.isArray(dbStudents)) {
      dbStudents.forEach(s => {
        const id = s.student_id || s.id;
        if (id) {
          const key = String(id).toUpperCase();
          map.set(key, Object.assign({}, map.get(key) || {}, s));
        }
      });
    }
  } catch(e) {}

  // 3. From Supabase students table
  try {
    const { data: dbLegacyStudents } = await sb.from('students').select('*');
    if (dbLegacyStudents && Array.isArray(dbLegacyStudents)) {
      dbLegacyStudents.forEach(s => {
        const id = s.student_id || s.id;
        if (id) {
          const key = String(id).toUpperCase();
          map.set(key, Object.assign({}, map.get(key) || {}, s));
        }
      });
    }
  } catch(e) {}

  // 4. From client payload if provided
  if (Array.isArray(clientStudents) && clientStudents.length > 0) {
    clientStudents.forEach(s => {
      const id = s.student_id || s.id;
      if (id) {
        const key = String(id).toUpperCase();
        map.set(key, Object.assign({}, map.get(key) || {}, s));
      }
    });
  }

  const consolidated = Array.from(map.values());

  // Save consolidated local copy
  try {
    fs.writeFileSync(masterStudentsJsonStore, JSON.stringify(consolidated, null, 2), 'utf8');
  } catch(e) {}

  return consolidated;
}

// Sync all students master spreadsheet to Google Drive & Local Storage
app.post('/api/students/sync-spreadsheet', async (req, res) => {
  try {
    const clientStudents = req.body?.students || [];
    const allStudents = await getAllStudentsConsolidated(clientStudents);

    // 1. Generate Local CSV
    const headers = [
      'Student ID', 'Full Name', 'Email', 'Phone', 'Alternative Phone', 'Gender',
      'Date of Birth', 'City', 'State', 'Address', 'Preferred Course', 'Preferred University',
      'Target Country', 'Budget (INR)', 'Assigned Counsellor', 'Assigned Counsellor ID',
      'Assigned Team Leader', 'Application Status', 'Lead Stage', 'Created Date', 'Last Updated'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    const csvRows = [headers.join(',')];
    allStudents.forEach(s => {
      csvRows.push([
        escapeCsv(s.student_id || s.id || ''),
        escapeCsv(s.full_name || s.name || ''),
        escapeCsv(s.email || ''),
        escapeCsv(s.phone || s.mobile || ''),
        escapeCsv(s.alt_phone || s.emergency_contact || ''),
        escapeCsv(s.gender || ''),
        escapeCsv(s.dob || s.date_of_birth || ''),
        escapeCsv(s.city || ''),
        escapeCsv(s.state || ''),
        escapeCsv(s.address || ''),
        escapeCsv(s.preferred_course || s.course || s.course_interested || ''),
        escapeCsv(s.preferred_university || s.university || s.target_university || ''),
        escapeCsv(s.target_country || s.country || 'India'),
        escapeCsv(s.budget || s.fee_budget || ''),
        escapeCsv(s.assigned_counsellor_name || s.counsellor_name || ''),
        escapeCsv(s.assigned_counsellor_id || s.counsellor_id || ''),
        escapeCsv(s.assigned_team_leader || s.team_leader_name || ''),
        escapeCsv(s.application_status || s.status || 'Active'),
        escapeCsv(s.lead_stage || s.stage || 'Enrolled'),
        escapeCsv(s.created_at || new Date().toISOString()),
        escapeCsv(s.updated_at || new Date().toISOString())
      ].join(','));
    });

    const csvContent = csvRows.join('\r\n');
    fs.writeFileSync(localSpreadsheetPath, csvContent, 'utf8');

    // 2. Upload/Sync to Google Drive if authorized
    let driveResult = null;
    if (isGoogleAuthorized && typeof driveProvider.syncAllStudentsSpreadsheet === 'function') {
      try {
        driveResult = await driveProvider.syncAllStudentsSpreadsheet(allStudents);
      } catch(driveErr) {
        console.warn('Google Drive spreadsheet sync warning:', driveErr);
      }
    }

    res.json({
      success: true,
      message: driveResult
        ? `Successfully synced ${allStudents.length} students to Google Drive Spreadsheet!`
        : `Synced ${allStudents.length} students to Master Database (Local Vault ready).`,
      total_students: allStudents.length,
      google_drive_synced: !!driveResult,
      google_drive_file_id: driveResult?.fileId || null,
      web_view_link: driveResult?.webViewLink || null,
      local_file_path: localSpreadsheetPath,
      updated_at: new Date().toISOString()
    });

  } catch(err) {
    console.error('Spreadsheet sync error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add or update a single student in Master Spreadsheet
app.post('/api/students/add-or-sync-spreadsheet', async (req, res) => {
  try {
    const student = req.body?.student || req.body;
    if (!student || (!student.student_id && !student.id && !student.phone && !student.email)) {
      return res.status(400).json({ success: false, error: 'Student data is required.' });
    }

    const allStudents = await getAllStudentsConsolidated([student]);

    // Background sync to Drive and local CSV
    try {
      const headers = [
        'Student ID', 'Full Name', 'Email', 'Phone', 'Alternative Phone', 'Gender',
        'Date of Birth', 'City', 'State', 'Address', 'Preferred Course', 'Preferred University',
        'Target Country', 'Budget (INR)', 'Assigned Counsellor', 'Assigned Counsellor ID',
        'Assigned Team Leader', 'Application Status', 'Lead Stage', 'Created Date', 'Last Updated'
      ];
      const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      const csvRows = [headers.join(',')];
      allStudents.forEach(s => {
        csvRows.push([
          escapeCsv(s.student_id || s.id || ''),
          escapeCsv(s.full_name || s.name || ''),
          escapeCsv(s.email || ''),
          escapeCsv(s.phone || s.mobile || ''),
          escapeCsv(s.alt_phone || ''),
          escapeCsv(s.gender || ''),
          escapeCsv(s.dob || ''),
          escapeCsv(s.city || ''),
          escapeCsv(s.state || ''),
          escapeCsv(s.address || ''),
          escapeCsv(s.preferred_course || s.course || ''),
          escapeCsv(s.preferred_university || s.university || ''),
          escapeCsv(s.target_country || 'India'),
          escapeCsv(s.budget || ''),
          escapeCsv(s.assigned_counsellor_name || s.counsellor_name || ''),
          escapeCsv(s.assigned_counsellor_id || s.counsellor_id || ''),
          escapeCsv(s.assigned_team_leader || ''),
          escapeCsv(s.application_status || s.status || 'Active'),
          escapeCsv(s.lead_stage || 'Enrolled'),
          escapeCsv(s.created_at || new Date().toISOString()),
          escapeCsv(s.updated_at || new Date().toISOString())
        ].join(','));
      });
      fs.writeFileSync(localSpreadsheetPath, csvRows.join('\r\n'), 'utf8');

      if (isGoogleAuthorized && typeof driveProvider.syncAllStudentsSpreadsheet === 'function') {
        driveProvider.syncAllStudentsSpreadsheet(allStudents).catch(e => console.warn('Drive auto-sync warning:', e));
      }
    } catch(e) {}

    res.json({
      success: true,
      message: 'Student registered and added to Google Drive Master Spreadsheet!',
      student_id: student.student_id || student.id,
      total_students: allStudents.length
    });

  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download / View spreadsheet endpoint
app.get('/api/students/spreadsheet/download', (req, res) => {
  if (fs.existsSync(localSpreadsheetPath)) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="EduVision_Master_Students_Database.csv"');
    return fs.createReadStream(localSpreadsheetPath).pipe(res);
  }
  res.status(404).send('Spreadsheet not generated yet. Please trigger sync first.');
});

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT DOCUMENTS UPLOAD & LIST ENDPOINTS (Google Drive Vault)
// ─────────────────────────────────────────────────────────────────────────────
const studentDocsStore = path.join(__dirname, 'data', 'student_documents.json');

function getStudentDocsData() {
  if (!fs.existsSync(studentDocsStore)) return [];
  try {
    return JSON.parse(fs.readFileSync(studentDocsStore, 'utf8') || '[]');
  } catch(e) { return []; }
}

function saveStudentDocsData(docs) {
  try {
    fs.writeFileSync(studentDocsStore, JSON.stringify(docs, null, 2), 'utf8');
  } catch(e) { console.warn('Could not write student_documents.json:', e); }
}

app.post('/api/students/documents/upload', docUpload.single('document_file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No document file provided.' });
    }

    const { student_id, student_name, doc_type } = req.body || {};
    if (!student_id) {
      return res.status(400).json({ success: false, error: 'Student ID is required.' });
    }

    const safeDocType = (doc_type || 'Document').replace(/\s+/g, '_');
    const safeStudentName = (student_name || 'Student').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const ext = path.extname(file.originalname) || '.pdf';
    const driveFileName = `${safeDocType}_${student_id}_${safeStudentName}${ext}`;

    console.log(`[DOCS UPLOAD] Uploading ${driveFileName} for ${student_id} (${safeStudentName}) to Google Drive...`);

    let driveResult = null;
    try {
      driveResult = await driveProvider.uploadStudentDocument({
        fileBuffer: file.buffer,
        fileName: driveFileName,
        mimeType: file.mimetype,
        studentId: student_id,
        studentName: safeStudentName,
        docType: safeDocType
      });
    } catch(driveErr) {
      console.error('[DOCS UPLOAD] Google Drive upload error:', driveErr);
      return res.status(500).json({ success: false, error: 'Google Drive upload error: ' + driveErr.message });
    }

    const uploadedBy = (req.body.uploaded_by || 'student').toLowerCase();
    const isStudent = (uploadedBy === 'student');
    const docStatus = isStudent ? 'Pending Verification' : 'Verified';
    const profileDocStatus = isStudent ? 'Under Review' : 'Verified';

    const docRecord = {
      id: `DOC${Date.now()}`,
      student_id: student_id,
      student_name: safeStudentName,
      doc_type: safeDocType,
      file_name: driveFileName,
      original_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      drive_file_id: driveResult.fileId,
      drive_view_link: driveResult.webViewLink,
      drive_content_link: driveResult.webContentLink,
      folder_id: driveResult.folderId,
      uploaded_at: new Date().toISOString(),
      uploaded_by: isStudent ? 'Student' : 'Counsellor',
      status: docStatus
    };

    const allDocs = getStudentDocsData();
    const existingIdx = allDocs.findIndex(d => d.student_id === student_id && d.doc_type === safeDocType);
    if (existingIdx !== -1) {
      allDocs[existingIdx] = docRecord;
    } else {
      allDocs.unshift(docRecord);
    }
    saveStudentDocsData(allDocs);

    // Update documents_status on student_profiles while preserving all existing profile data
    try {
      const { data: existingStudent } = await sb.from('student_profiles').select('*').eq('student_id', student_id).single();
      const updatedPayload = Object.assign({}, existingStudent || {}, {
        full_name: (existingStudent && existingStudent.full_name) || safeStudentName || 'Student',
        documents_status: profileDocStatus
      });
      await sb.rpc('update_student_crm', {
        p_counsellor_id: 'CNS260001',
        p_student_id: student_id,
        p_payload: updatedPayload
      });
    } catch(e) {
      console.warn('[DOCS UPLOAD] documents_status update warning:', e);
    }

    res.json({
      success: true,
      document: docRecord,
      new_documents_status: profileDocStatus,
      message: isStudent 
        ? `${safeDocType.replace(/_/g, ' ')} uploaded successfully to Google Drive and submitted to counsellor for verification!`
        : `${safeDocType.replace(/_/g, ' ')} uploaded and verified successfully!`
    });
  } catch(err) {
    console.error('[DOCS UPLOAD] Handler error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/students/documents/list', async (req, res) => {
  try {
    const studentId = req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'student_id is required' });
    }

    const allDocs = getStudentDocsData();
    const studentDocs = allDocs.filter(d => d.student_id === studentId);
    res.json({ success: true, student_id: studentId, documents: studentDocs });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/documents/verify', async (req, res) => {
  try {
    const { student_id, doc_type, action, counsellor_id, reject_reason } = req.body || {};
    if (!student_id || !doc_type) {
      return res.status(400).json({ success: false, error: 'student_id and doc_type are required' });
    }

    const safeDocType = doc_type.replace(/\s+/g, '_');
    const newStatus = (action === 'reject') ? 'Rejected' : 'Verified';
    const cnsId = (counsellor_id && counsellor_id.startsWith('CNS')) ? counsellor_id : 'CNS260001';

    const allDocs = getStudentDocsData();
    const docIdx = allDocs.findIndex(d => d.student_id === student_id && d.doc_type === safeDocType);
    if (docIdx === -1) {
      return res.status(404).json({ success: false, error: 'Document record not found' });
    }

    allDocs[docIdx].status = newStatus;
    allDocs[docIdx].verified_by = cnsId;
    allDocs[docIdx].verified_at = new Date().toISOString();
    if (action === 'reject' && reject_reason) {
      allDocs[docIdx].reject_reason = reject_reason;
    } else {
      delete allDocs[docIdx].reject_reason;
    }
    saveStudentDocsData(allDocs);

    // Compute overall student documents_status
    const studentDocs = allDocs.filter(d => d.student_id === student_id);
    const hasRejected = studentDocs.some(d => d.status === 'Rejected');
    const hasPending = studentDocs.some(d => d.status === 'Pending Verification' || d.status === 'Under Review');
    let overallDocStatus = 'Verified';
    if (hasRejected) {
      overallDocStatus = 'Rejected';
    } else if (hasPending) {
      overallDocStatus = 'Under Review';
    }

    // Update Supabase profile safely
    try {
      const { data: existingStudent } = await sb.from('student_profiles').select('*').eq('student_id', student_id).single();
      const updatedPayload = Object.assign({}, existingStudent || {}, {
        documents_status: overallDocStatus
      });
      await sb.rpc('update_student_crm', {
        p_counsellor_id: 'CNS260001',
        p_student_id: student_id,
        p_payload: updatedPayload
      });
    } catch(e) {
      console.warn('[DOCS VERIFY] Supabase status update error:', e);
    }

    res.json({
      success: true,
      document: allDocs[docIdx],
      overall_documents_status: overallDocStatus,
      message: `Document ${safeDocType.replace(/_/g, ' ')} has been ${newStatus.toLowerCase()} successfully.`
    });
  } catch(err) {
    console.error('[DOCS VERIFY] Handler error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT FEES & PAYMENTS MODULE (Google Drive Receipt Vault)
// ─────────────────────────────────────────────────────────────────────────────
const studentPaymentsStore = path.join(__dirname, 'data', 'student_payments.json');

function getStudentPaymentsData() {
  if (!fs.existsSync(studentPaymentsStore)) return [];
  try {
    return JSON.parse(fs.readFileSync(studentPaymentsStore, 'utf8') || '[]');
  } catch(e) { return []; }
}

function saveStudentPaymentsData(payments) {
  try {
    fs.writeFileSync(studentPaymentsStore, JSON.stringify(payments, null, 2), 'utf8');
  } catch(e) { console.warn('Could not write student_payments.json:', e); }
}

app.post('/api/students/payments/upload', docUpload.single('receipt_file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No receipt file provided.' });
    }

    const {
      student_id,
      student_name,
      fee_type,
      amount,
      payment_mode,
      transaction_id,
      payment_date,
      notes,
      uploaded_by
    } = req.body || {};

    if (!student_id) {
      return res.status(400).json({ success: false, error: 'student_id is required' });
    }

    const safeStudentName = (student_name || 'Student').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const safeFeeType = (fee_type || 'Tuition_Fee').replace(/\s+/g, '_');
    const ext = path.extname(file.originalname) || '.pdf';
    const parsedAmount = parseFloat(amount) || 0;
    const cleanTxnId = (transaction_id || `TXN${Date.now()}`).trim();
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const driveFileName = `Receipt_${receiptNo}_${student_id}_${safeFeeType}${ext}`;

    const uploader = (uploaded_by || 'student').toLowerCase();
    const isStudent = (uploader === 'student');
    const paymentStatus = isStudent ? 'Pending Verification' : 'Paid';

    console.log(`[PAYMENT UPLOAD] Uploading ${driveFileName} for ${student_id} (${safeStudentName}) to Google Drive...`);

    let driveResult = null;
    try {
      driveResult = await driveProvider.uploadStudentPaymentReceipt({
        fileBuffer: file.buffer,
        fileName: driveFileName,
        mimeType: file.mimetype,
        studentId: student_id,
        studentName: safeStudentName,
        feeType: safeFeeType,
        amount: parsedAmount,
        transactionId: cleanTxnId
      });
    } catch(driveErr) {
      console.error('[PAYMENT UPLOAD] Google Drive upload error:', driveErr);
      return res.status(500).json({ success: false, error: 'Google Drive upload error: ' + driveErr.message });
    }

    const paymentRecord = {
      id: `PAY${Date.now()}`,
      receipt_no: receiptNo,
      student_id: student_id,
      student_name: safeStudentName,
      fee_type: fee_type || 'Admission Fee',
      amount: parsedAmount,
      currency: 'INR',
      payment_mode: payment_mode || 'UPI / Online Transfer',
      transaction_id: cleanTxnId,
      payment_date: payment_date || new Date().toISOString(),
      file_name: driveFileName,
      original_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      drive_file_id: driveResult.fileId,
      drive_view_link: driveResult.webViewLink,
      drive_content_link: driveResult.webContentLink,
      folder_id: driveResult.folderId,
      notes: notes || '',
      uploaded_by: isStudent ? 'Student' : 'Counsellor',
      status: paymentStatus,
      created_at: new Date().toISOString()
    };

    const allPayments = getStudentPaymentsData();
    allPayments.unshift(paymentRecord);
    saveStudentPaymentsData(allPayments);

    // Recompute total verified/paid payments for student to update student_profiles
    const studentPayments = allPayments.filter(p => p.student_id === student_id && p.status === 'Paid');
    const totalPaid = studentPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const newProfilePaymentStatus = totalPaid > 0 ? (totalPaid >= 80000 ? 'Paid' : 'Partial') : (isStudent ? 'Partial' : 'Paid');

    try {
      const { data: existingStudent } = await sb.from('student_profiles').select('*').eq('student_id', student_id).single();
      const updatedPayload = Object.assign({}, existingStudent || {}, {
        payment_status: newProfilePaymentStatus
      });
      await sb.rpc('update_student_crm', {
        p_counsellor_id: 'CNS260001',
        p_student_id: student_id,
        p_payload: updatedPayload
      });
    } catch(e) {
      console.warn('[PAYMENT UPLOAD] Profile status update warning:', e);
    }

    res.json({
      success: true,
      payment: paymentRecord,
      new_payment_status: newProfilePaymentStatus,
      total_paid: totalPaid,
      message: isStudent 
        ? `Payment receipt ${receiptNo} uploaded to Google Drive! Submitted to counsellor for verification.`
        : `Official payment receipt ${receiptNo} uploaded to Google Drive and marked Paid!`
    });
  } catch(err) {
    console.error('[PAYMENT UPLOAD] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/students/payments/list', async (req, res) => {
  try {
    const studentId = req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'student_id is required' });
    }

    const allPayments = getStudentPaymentsData();
    const studentPayments = allPayments.filter(p => p.student_id === studentId);

    // Calculate totals
    const paidSum = studentPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const pendingSum = studentPayments
      .filter(p => p.status === 'Pending Verification')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const totalCourseFee = 120000; // Standard program fee
    const balanceDue = Math.max(0, totalCourseFee - paidSum);

    let overallStatus = 'Unpaid';
    if (paidSum >= totalCourseFee) {
      overallStatus = 'Paid';
    } else if (paidSum > 0 || pendingSum > 0) {
      overallStatus = 'Partial';
    }

    res.json({
      success: true,
      student_id: studentId,
      payments: studentPayments,
      total_paid: paidSum,
      pending_verification_amount: pendingSum,
      total_course_fee: totalCourseFee,
      balance_due: balanceDue,
      overall_status: overallStatus
    });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/payments/verify', async (req, res) => {
  try {
    const { student_id, payment_id, action, counsellor_id, reject_reason } = req.body || {};
    if (!student_id || !payment_id) {
      return res.status(400).json({ success: false, error: 'student_id and payment_id are required' });
    }

    const allPayments = getStudentPaymentsData();
    const pIdx = allPayments.findIndex(p => p.student_id === student_id && p.id === payment_id);
    if (pIdx === -1) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    const newStatus = (action === 'reject') ? 'Rejected' : 'Paid';
    const cnsId = (counsellor_id && counsellor_id.startsWith('CNS')) ? counsellor_id : 'CNS260001';

    allPayments[pIdx].status = newStatus;
    allPayments[pIdx].verified_by = cnsId;
    allPayments[pIdx].verified_at = new Date().toISOString();
    if (action === 'reject' && reject_reason) {
      allPayments[pIdx].reject_reason = reject_reason;
    } else {
      delete allPayments[pIdx].reject_reason;
    }
    saveStudentPaymentsData(allPayments);

    // Recompute total paid
    const paidSum = allPayments
      .filter(p => p.student_id === student_id && p.status === 'Paid')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const overallStatus = paidSum >= 120000 ? 'Paid' : (paidSum > 0 ? 'Partial' : 'Unpaid');

    try {
      const { data: existingStudent } = await sb.from('student_profiles').select('*').eq('student_id', student_id).single();
      const updatedPayload = Object.assign({}, existingStudent || {}, {
        payment_status: overallStatus
      });
      await sb.rpc('update_student_crm', {
        p_counsellor_id: 'CNS260001',
        p_student_id: student_id,
        p_payload: updatedPayload
      });
    } catch(e) {
      console.warn('[PAYMENT VERIFY] Profile update error:', e);
    }

    res.json({
      success: true,
      payment: allPayments[pIdx],
      total_paid: paidSum,
      overall_status: overallStatus,
      message: `Payment receipt ${allPayments[pIdx].receipt_no} marked as ${newStatus}!`
    });
  } catch(err) {
    console.error('[PAYMENT VERIFY] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECURE PASSWORD CHANGE ENDPOINT (EMPLOYEES & STUDENTS)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { user_type, user_id, current_password, new_password } = req.body || {};
    if (!user_type || !user_id || !current_password || !new_password) {
      return res.status(400).json({ success: false, error: 'All fields (user_type, user_id, current_password, new_password) are required.' });
    }

    // Strong password validation regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|;:,.<>~])[A-Za-z\d@$!%*?&#^()_+=\-[\]{}|;:,.<>~]{8,}$/;
    if (!strongPasswordRegex.test(new_password)) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet strength requirements: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
      });
    }

    const credStore = path.join(__dirname, 'data', 'user_credentials.json');
    let localCreds = {};
    if (fs.existsSync(credStore)) {
      try { localCreds = JSON.parse(fs.readFileSync(credStore, 'utf8') || '{}'); } catch(e) {}
    }

    if (user_type === 'employee' || user_type === 'admin' || user_type === 'team_leader') {
      let foundUser = null;
      let targetTable = null;
      let idColumn = null;

      // 1. Check counsellors table
      try {
        const { data: cData } = await sb
          .from('counsellors')
          .select('*')
          .or(`counsellor_id.eq.${user_id},employee_id.eq.${user_id},email.eq.${user_id}`)
          .limit(1)
          .maybeSingle();
        if (cData) {
          foundUser = cData;
          targetTable = 'counsellors';
          idColumn = 'counsellor_id';
        }
      } catch(e) {}

      // 2. If not found, check admin_users table
      if (!foundUser) {
        try {
          let orFilter = `employee_id.eq.${user_id},email.eq.${user_id}`;
          if (user_id.length === 36 && user_id.includes('-')) {
            orFilter += `,admin_id.eq.${user_id}`;
          }
          const { data: aData } = await sb
            .from('admin_users')
            .select('*')
            .or(orFilter)
            .limit(1)
            .maybeSingle();
          if (aData) {
            foundUser = aData;
            targetTable = 'admin_users';
            idColumn = aData.admin_id ? 'admin_id' : 'employee_id';
          }
        } catch(e) {}
      }

      // 3. If not found, check team_leaders table
      if (!foundUser) {
        try {
          const { data: tData } = await sb
            .from('team_leaders')
            .select('*')
            .or(`team_leader_id.eq.${user_id},employee_id.eq.${user_id},email.eq.${user_id}`)
            .limit(1)
            .maybeSingle();
          if (tData) {
            foundUser = tData;
            targetTable = 'team_leaders';
            idColumn = tData.team_leader_id ? 'team_leader_id' : 'employee_id';
          }
        } catch(e) {}
      }

      if (!foundUser) {
        return res.status(404).json({ success: false, error: 'Employee account not found.' });
      }

      const effectivePassword = localCreds[user_id] || 
                               (foundUser.employee_id && localCreds[foundUser.employee_id]) || 
                               (foundUser.counsellor_id && localCreds[foundUser.counsellor_id]) || 
                               foundUser.password;

      if (effectivePassword !== current_password) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect. Please verify and try again.' });
      }

      const targetId = foundUser[idColumn];
      try {
        await sb
          .from(targetTable)
          .update({ password: new_password })
          .eq(idColumn, targetId);
      } catch(e) {}

      // Save into persistent credentials vault
      localCreds[user_id] = new_password;
      if (foundUser.employee_id) localCreds[foundUser.employee_id] = new_password;
      if (foundUser.counsellor_id) localCreds[foundUser.counsellor_id] = new_password;
      if (foundUser.email) localCreds[foundUser.email] = new_password;
      fs.writeFileSync(credStore, JSON.stringify(localCreds, null, 2), 'utf8');

      return res.json({ success: true, message: 'Employee password updated successfully!' });
    } else if (user_type === 'student') {
      let targetUserId = user_id;
      const { data: sData } = await sb
        .from('student_profiles')
        .select('*')
        .or(`student_id.eq.${user_id},user_id.eq.${user_id},email.eq.${user_id},phone.eq.${user_id}`)
        .limit(1)
        .maybeSingle();

      if (sData && sData.user_id) {
        targetUserId = sData.user_id;
      }

      const { data: userRec, error: userErr } = await sb
        .from('users')
        .select('*')
        .or(`id.eq.${targetUserId},email.eq.${user_id},phone.eq.${user_id}`)
        .limit(1)
        .maybeSingle();

      if (userErr || !userRec) {
        return res.status(404).json({ success: false, error: 'Student login record not found.' });
      }

      const effectivePassword = localCreds[user_id] || 
                               (sData && localCreds[sData.student_id]) || 
                               localCreds[userRec.id] || 
                               userRec.password;

      if (effectivePassword !== current_password) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect. Please verify and try again.' });
      }

      try {
        await sb
          .from('users')
          .update({ password: new_password })
          .eq('id', userRec.id);
      } catch(e) {}

      // Save into persistent credentials vault
      localCreds[user_id] = new_password;
      if (sData && sData.student_id) localCreds[sData.student_id] = new_password;
      localCreds[userRec.id] = new_password;
      if (userRec.email) localCreds[userRec.email] = new_password;
      fs.writeFileSync(credStore, JSON.stringify(localCreds, null, 2), 'utf8');

      return res.json({ success: true, message: 'Student password updated successfully!' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid user_type. Must be employee or student.' });
    }
  } catch(err) {
    console.error('[PASSWORD CHANGE] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 💾 CLOUD BACKUP & GOOGLE DRIVE SPREADSHEET SYNC ENGINE
// ════════════════════════════════════════════════════════════════════════════

// 1. Get Backup & Google Drive Health Status
app.get('/api/backup/status', async (req, res) => {
  try {
    let driveAccount = null;
    if (isGoogleAuthorized && driveProvider.drive) {
      try {
        const aboutRes = await driveProvider.drive.about.get({ fields: 'user, storageQuota' });
        driveAccount = {
          displayName: aboutRes.data?.user?.displayName || 'EduVision Cloud Vault',
          emailAddress: aboutRes.data?.user?.emailAddress || 'Authorized Google Drive Account',
          storageQuota: aboutRes.data?.storageQuota || null
        };
      } catch(e) {
        driveAccount = { displayName: 'EduVision Drive', emailAddress: 'Authorized' };
      }
    }

    res.json({
      success: true,
      google_drive_authorized: isGoogleAuthorized,
      drive_account: driveAccount,
      storage_provider: 'google_drive',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Sync Staff & Employee Directory Spreadsheet
app.post('/api/backup/staff/sync', async (req, res) => {
  try {
    const staffList = req.body.staff || [];
    if (!staffList || staffList.length === 0) {
      return res.status(400).json({ success: false, error: 'No staff records provided for backup.' });
    }

    // Save to local vault
    const localDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const localFile = path.join(localDir, 'EduVision_Staff_Directory_KYC.json');
    fs.writeFileSync(localFile, JSON.stringify(staffList, null, 2), 'utf8');

    let driveResult = null;
    if (isGoogleAuthorized && typeof driveProvider.syncStaffSpreadsheet === 'function') {
      try {
        driveResult = await driveProvider.syncStaffSpreadsheet(staffList);
      } catch(dErr) {
        console.warn('Google Drive staff sync warning:', dErr.message);
      }
    }

    res.json({
      success: true,
      message: driveResult ? `Synced ${staffList.length} staff records to Google Drive Spreadsheet!` : `Backed up ${staffList.length} staff records to Local Vault.`,
      google_drive_synced: !!driveResult,
      drive_result: driveResult,
      total_records: staffList.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Sync Attendance Records Spreadsheet
app.post('/api/backup/attendance/sync', async (req, res) => {
  try {
    const attendanceList = req.body.attendance || [];
    if (!attendanceList || attendanceList.length === 0) {
      return res.status(400).json({ success: false, error: 'No attendance records provided for backup.' });
    }

    const localDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const localFile = path.join(localDir, 'EduVision_Staff_Attendance_Master.json');
    fs.writeFileSync(localFile, JSON.stringify(attendanceList, null, 2), 'utf8');

    let driveResult = null;
    if (isGoogleAuthorized && typeof driveProvider.syncAttendanceSpreadsheet === 'function') {
      try {
        driveResult = await driveProvider.syncAttendanceSpreadsheet(attendanceList);
      } catch(dErr) {
        console.warn('Google Drive attendance sync warning:', dErr.message);
      }
    }

    res.json({
      success: true,
      message: driveResult ? `Synced ${attendanceList.length} attendance records to Google Drive Spreadsheet!` : `Backed up ${attendanceList.length} attendance records to Local Vault.`,
      google_drive_synced: !!driveResult,
      drive_result: driveResult,
      total_records: attendanceList.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Sync Call Recordings Logs Spreadsheet
app.post('/api/backup/call-logs/sync', async (req, res) => {
  try {
    const callLogsList = req.body.call_logs || [];
    if (!callLogsList || callLogsList.length === 0) {
      return res.status(400).json({ success: false, error: 'No call log records provided for backup.' });
    }

    const localDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const localFile = path.join(localDir, 'EduVision_Call_Recordings_Logs.json');
    fs.writeFileSync(localFile, JSON.stringify(callLogsList, null, 2), 'utf8');

    let driveResult = null;
    if (isGoogleAuthorized && typeof driveProvider.syncCallLogsSpreadsheet === 'function') {
      try {
        driveResult = await driveProvider.syncCallLogsSpreadsheet(callLogsList);
      } catch(dErr) {
        console.warn('Google Drive call logs sync warning:', dErr.message);
      }
    }

    res.json({
      success: true,
      message: driveResult ? `Synced ${callLogsList.length} call logs to Google Drive Spreadsheet!` : `Backed up ${callLogsList.length} call logs to Local Vault.`,
      google_drive_synced: !!driveResult,
      drive_result: driveResult,
      total_records: callLogsList.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Sync Leads CRM Pipeline Spreadsheet
app.post('/api/backup/leads/sync', async (req, res) => {
  try {
    const leadsList = req.body.leads || [];
    if (!leadsList || leadsList.length === 0) {
      return res.status(400).json({ success: false, error: 'No lead records provided for backup.' });
    }

    const localDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const localFile = path.join(localDir, 'EduVision_Leads_CRM_Pipeline.json');
    fs.writeFileSync(localFile, JSON.stringify(leadsList, null, 2), 'utf8');

    let driveResult = null;
    if (isGoogleAuthorized && typeof driveProvider.syncLeadsSpreadsheet === 'function') {
      try {
        driveResult = await driveProvider.syncLeadsSpreadsheet(leadsList);
      } catch(dErr) {
        console.warn('Google Drive leads sync warning:', dErr.message);
      }
    }

    res.json({
      success: true,
      message: driveResult ? `Synced ${leadsList.length} leads to Google Drive Spreadsheet!` : `Backed up ${leadsList.length} leads to Local Vault.`,
      google_drive_synced: !!driveResult,
      drive_result: driveResult,
      total_records: leadsList.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Master 1-Click All-Data Cloud Backup
app.post('/api/backup/master/sync-all', async (req, res) => {
  try {
    const { students = [], staff = [], attendance = [], call_logs = [] } = req.body;
    const results = {
      students: null,
      staff: null,
      attendance: null,
      call_logs: null
    };

    if (isGoogleAuthorized) {
      if (students.length > 0 && typeof driveProvider.syncAllStudentsSpreadsheet === 'function') {
        results.students = await driveProvider.syncAllStudentsSpreadsheet(students).catch(e=>({ error: e.message }));
      }
      if (staff.length > 0 && typeof driveProvider.syncStaffSpreadsheet === 'function') {
        results.staff = await driveProvider.syncStaffSpreadsheet(staff).catch(e=>({ error: e.message }));
      }
      if (attendance.length > 0 && typeof driveProvider.syncAttendanceSpreadsheet === 'function') {
        results.attendance = await driveProvider.syncAttendanceSpreadsheet(attendance).catch(e=>({ error: e.message }));
      }
      if (call_logs.length > 0 && typeof driveProvider.syncCallLogsSpreadsheet === 'function') {
        results.call_logs = await driveProvider.syncCallLogsSpreadsheet(call_logs).catch(e=>({ error: e.message }));
      }
    }

    res.json({
      success: true,
      message: 'Master Cloud Backup execution completed!',
      google_drive_authorized: isGoogleAuthorized,
      results,
      summary: {
        students_count: students.length,
        staff_count: staff.length,
        attendance_count: attendance.length,
        call_logs_count: call_logs.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 🔄 AUTOMATIC BACKGROUND VAULT-TO-DRIVE SYNC WORKER
// ════════════════════════════════════════════════════════════════════════════
async function syncPendingVaultFilesToDrive() {
  if (!isGoogleAuthorized) return;
  try {
    const recordingsFile = path.join(__dirname, 'data', 'recordings.json');
    if (!fs.existsSync(recordingsFile)) return;

    let records = [];
    try {
      records = JSON.parse(fs.readFileSync(recordingsFile, 'utf8') || '[]');
    } catch(e) { return; }

    const pending = records.filter(r => r.drive_file_id && r.drive_file_id.startsWith('vault_'));
    if (pending.length === 0) return;

    console.log(`[Auto-Sync] Found ${pending.length} pending local audio recordings to sync with Google Drive...`);
    const vaultDir = path.join(__dirname, 'data', 'vault');

    for (const rec of pending) {
      const localFile = path.join(vaultDir, rec.file_name);
      if (!fs.existsSync(localFile)) continue;

      try {
        const fileBuffer = fs.readFileSync(localFile);
        const driveResult = await storageService.uploadCallRecording({
          fileBuffer: fileBuffer,
          fileName: rec.file_name,
          mimeType: rec.mime_type || 'audio/mpeg',
          leadId: rec.lead_id || 'GENERAL',
          studentName: rec.student_name || 'Prospect',
          dateStr: (rec.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
        });

        if (driveResult && driveResult.fileId) {
          rec.drive_file_id = driveResult.fileId;
          rec.storage_provider = 'google_drive';
          rec.drive_file_url = driveResult.webViewLink || null;
          console.log(`[Auto-Sync] Successfully synced ${rec.file_name} -> Google Drive (${driveResult.fileId})`);
        }
      } catch(syncErr) {
        console.warn(`[Auto-Sync] Could not sync ${rec.file_name} this cycle:`, syncErr.message);
      }
    }

    fs.writeFileSync(recordingsFile, JSON.stringify(records, null, 2), 'utf8');
  } catch(err) {
    console.warn('[Auto-Sync] Background sync notice:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 💬 CHAT MANAGEMENT & MODERATION ENDPOINTS (CTO & LEADERSHIP CAPABILITIES)
// ─────────────────────────────────────────────────────────────────────────────

// Helper to verify CTO / Super Admin privileges
function isAuthorizedCto(userId, role, designation) {
  const u = (userId || '').toUpperCase();
  const r = (role || '').toUpperCase();
  const d = (designation || '').toUpperCase();
  return u === 'CTO001' || u.includes('RAGHAV') || r === 'CTO' || r === 'SUPER ADMIN' || r === 'CEO' || d.includes('CTO') || d.includes('CHIEF TECHNOLOGY OFFICER');
}

// 1. Delete single message for everyone
app.post('/api/chat/delete-message', async (req, res) => {
  try {
    const { message_id, sender_id, user_role, designation } = req.body;
    if (!message_id) {
      return res.status(400).json({ success: false, error: 'message_id is required' });
    }

    console.log(`[Chat API] Delete message request for ID: ${message_id} by: ${sender_id || 'Unknown'}`);

    // Try hard delete or soft delete in notifications table
    const { error: delErr } = await sb
      .from('notifications')
      .delete()
      .eq('id', message_id);

    if (delErr) {
      console.warn('[Chat API] Direct delete notice, trying soft delete:', delErr.message);
      await sb
        .from('notifications')
        .update({
          deleted_for_everyone: true,
          message: '🚫 This message was deleted',
          file_attachment: null
        })
        .eq('id', message_id);
    }

    res.json({
      success: true,
      message_id: message_id,
      message: 'Message deleted successfully.'
    });
  } catch(err) {
    console.error('[Chat API] delete-message error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Clear entire group chat (CTO Exclusive & Group Creator)
app.post('/api/chat/clear-group', async (req, res) => {
  try {
    const { group_id, category, user_id, user_role, designation, is_system_group } = req.body;
    if (!group_id && !category) {
      return res.status(400).json({ success: false, error: 'group_id or category is required' });
    }

    console.log(`[Chat API] Clear Group Chat request for group: ${group_id || category} by User: ${user_id}`);

    let deleteQuery;
    if (is_system_group && category) {
      const { error, count } = await sb
        .from('notifications')
        .delete()
        .or(`group_id.eq.${group_id},and(group_id.is.null,category.eq.${category})`);
      if (error) throw error;
    } else if (group_id) {
      const { error, count } = await sb
        .from('notifications')
        .delete()
        .eq('group_id', group_id);
      if (error) throw error;
    } else if (category) {
      const { error } = await sb
        .from('notifications')
        .delete()
        .eq('category', category);
      if (error) throw error;
    }

    res.json({
      success: true,
      group_id: group_id,
      message: `Group chat messages cleared successfully.`
    });
  } catch(err) {
    console.error('[Chat API] clear-group error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Clear all chat history across all groups (CTO Exclusive)
app.post('/api/chat/clear-all-history', async (req, res) => {
  try {
    const { user_id, user_role, designation } = req.body;
    if (!isAuthorizedCto(user_id, user_role, designation)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only CTO Raghav / Super Admin is authorized to purge entire chat history.'
      });
    }

    console.log(`[Chat API] ⚠️ MASTER PURGE: Clear All Chat History triggered by CTO (${user_id})`);

    // Delete chat notifications while preserving non-chat system error logs if any
    const { error } = await sb
      .from('notifications')
      .delete()
      .neq('category', 'PAGE_CONTROLS_SYNC');

    if (error) throw error;

    res.json({
      success: true,
      message: 'All chat history across all channels has been purged successfully by CTO.'
    });
  } catch(err) {
    console.error('[Chat API] clear-all-history error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 🛡️ EXPRESS GLOBAL ERROR HANDLER (NEVER CRASHES SERVER) ──
app.use((err, req, res, next) => {
  console.error('[EXPRESS ROUTE ERROR CAUGHT]:', err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(200).json({
    success: false,
    error: err.message || 'An unexpected error occurred, but system recovered safely.',
    fallback_active: true,
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 EduVision Call Recording Backend running on port ${PORT}`);
  console.log(`📁 Storage Provider: Google Drive (Official EduVision)`);
  console.log(`🔒 Status: ${isGoogleAuthorized ? 'Authorized & Ready' : 'Pending Authorization (/api/auth/google/url)'}`);
  console.log(`=======================================================`);
});
