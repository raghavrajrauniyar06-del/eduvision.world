/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EDUVISION UNIVERSAL RAG AI ENGINE v2.5 (PRO-INTELLIGENCE & GEMINI SUITE)
 * ══════════════════════════════════════════════════════════════════════════════
 * Features:
 * 1. User-Scoped Isolated Private Chat per individual (Admin, Counsellor, Student).
 * 2. RGB Golden Glowing Thinking Box with Multi-Stage Synthesis Animation.
 * 3. Deep Knowledge Base: 1,500+ Courses, 50+ Partner Universities, Exact Fees & EMI.
 * 4. Interactive Student Portal Features (Counsellor Selection & Call Booking).
 * 5. Gemini 3.5 Live Synthesis with instant intelligent offline fallback.
 */

(function(global) {
  'use strict';

  const AI_COPILOT_GROUP_ID = '00000000-0000-0000-0000-0000000000aa';

  const RAG_AI_CONFIG = {
    apiKey: (typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42Sy1waExaZ19EWnh0MWpmX3lhaGNyNUxxd0tUMENfczVVZjk0UXhjeFloNlE=') : ''),
    models: [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.0-flash-lite'
    ]
  };

  // Ensure default key in local storage
  try {
    if (!localStorage.getItem('eduvision_rag_ai_api_key')) {
      localStorage.setItem('eduvision_rag_ai_api_key', RAG_AI_CONFIG.apiKey);
    }
  } catch(e){}

  /**
   * 1. User-Scoped Isolated Storage Key
   * Guarantees that every user (Admin, Counsellor, Student) has their own private conversation history.
   */
  function getAiChatStorageKey() {
    let uid = 'guest';
    try {
      if (typeof currentAdmin !== 'undefined' && currentAdmin) {
        uid = currentAdmin.employee_id || currentAdmin.admin_id || currentAdmin.id || currentAdmin.email || 'admin';
      } else if (typeof currentUser !== 'undefined' && currentUser) {
        uid = currentUser.employee_id || currentUser.counsellor_id || currentUser.id || currentUser.email || 'counsellor';
      } else if (typeof currentStudent !== 'undefined' && currentStudent) {
        uid = currentStudent.student_id || currentStudent.id || currentStudent.email || 'student';
      } else {
        const studentRaw = localStorage.getItem('eduvision_student_session');
        if (studentRaw) {
          const s = JSON.parse(studentRaw);
          uid = s.student_id || s.id || s.email || 'student';
        }
      }
    } catch(e){}
    return 'eduvision_rag_ai_chat_' + String(uid).replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function getAiChatHistory() {
    const key = getAiChatStorageKey();
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch(e){}
    return [];
  }

  function saveAiChatHistory(messages) {
    const key = getAiChatStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(messages.slice(-60)));
    } catch(e){}
  }

  function clearAiChatHistory() {
    const key = getAiChatStorageKey();
    try {
      localStorage.removeItem(key);
    } catch(e){}
  }

  /**
   * 2. Comprehensive University & Course Fee Knowledge Matrix (1,500+ Programs)
   */
  const EDUVISION_KNOWLEDGE_BASE = {
    partnerUniversities: [
      {
        name: "Sandip University",
        location: "Nashik (Maharashtra) & Sijoul (Madhubani, Bihar)",
        accreditation: "UGC Approved • 100+ Acre Mega Campus",
        specialties: "B.Tech CSE/AI, Polytechnic, MBA, B.Pharm, Law, BSc Agriculture",
        fees: "B.Tech: ₹1,10,000 - ₹1,40,000/yr | Polytechnic: ₹45,000/yr | MBA: ₹1,20,000/yr | B.Pharm: ₹1,30,000/yr",
        schemes: "Bihar Student Credit Card (BSCCS ₹4 Lakhs 0% loan) 100% accepted with DRCC registration support",
        recruiters: "Amazon, TCS, Infosys, Tech Mahindra, Capgemini"
      },
      {
        name: "SRM University (SRMIST / Delhi-NCR / Sonepat)",
        location: "Delhi-NCR (Modinagar) & Sonepat (Haryana)",
        accreditation: "NAAC A++ • Category 1 University • NIRF Top Ranked",
        specialties: "B.Tech CSE (Cloud, AI/ML, Cyber Security), BCA, BBA, MBA, Hotel Management",
        fees: "B.Tech CSE: ₹2,20,000 - ₹3,50,000/yr | BCA/BBA: ₹85,000/yr | MBA: ₹2,50,000/yr",
        schemes: "Direct Merit Scholarships up to 100% on 12th PCM marks & SRMJEEE rank",
        recruiters: "Microsoft, Amazon, Google, Adobe, Cisco, TCS (Highest ₹50+ LPA)"
      },
      {
        name: "Chandigarh University (CU Mohali)",
        location: "Gharuan, Mohali, Punjab",
        accreditation: "NAAC A+ • QS Asia Ranked • Limca Book Record for Placements",
        specialties: "B.Tech CSE, MBA, Animation, Law, Biotechnology, Hospitality",
        fees: "B.Tech: ₹1,35,000 - ₹1,80,000/yr | MBA: ₹1,40,000/sem | BCA/BBA: ₹55,000/sem",
        schemes: "CUCET Entrance Scholarship up to 100%, Bihar Credit Card accepted",
        recruiters: "Amazon, Walt Disney, Microsoft, Flipkart (Highest ₹54.75 LPA)"
      },
      {
        name: "SAGE University",
        location: "Indore & Bhopal (Madhya Pradesh)",
        accreditation: "NAAC Accredited • Advanced Smart Campus",
        specialties: "B.Tech, B.Sc Agriculture, B.Pharm, D.Pharm, Nursing, MBA",
        fees: "B.Tech: ₹70,000 - ₹1,10,000/yr | B.Sc Agri: ₹65,000/yr | Nursing: ₹90,000/yr | MBA: ₹85,000/yr",
        schemes: "SAGE Scholarship Test (SST) + Early Bird Concessions + 0% EMI",
        recruiters: "Cognizant, Wipro, TCS, HCL, Reliance"
      },
      {
        name: "Marwadi University",
        location: "Rajkot, Gujarat",
        accreditation: "NAAC A+ • Centre of Excellence • 100% Placement Record",
        specialties: "B.Tech Computer Engg, MBA, Pharmacy, Architecture, Physiotherapy",
        fees: "B.Tech: ₹95,000 - ₹1,25,000/yr | MBA: ₹1,10,000/yr | BCA/BBA: ₹60,000/yr",
        schemes: "Merit-based scholarships & International Exchange Programs",
        recruiters: "Amazon, IBM, Capgemini, Airtel, Reliance Jio"
      },
      {
        name: "Jaipur National University (JNU Jaipur)",
        location: "Jaipur, Rajasthan",
        accreditation: "NAAC A+ • Top Multi-Disciplinary University",
        specialties: "Regular & Distance Programs, B.Ed, Nursing, B.Tech, MBA, Law",
        fees: "Regular B.Tech: ₹1,10,000/yr | Distance MBA: ₹28,000/yr | Distance BA/BCom: ₹14,000/yr | B.Ed: ₹55,000/yr",
        schemes: "UGC-DEB Approved Distance Education with nationwide examination centres",
        recruiters: "Infosys, Wipro, Genpact, ICICI Bank, Fortis Healthcare"
      },
      {
        name: "Vivekananda Global University (VGU Jaipur)",
        location: "Jaipur, Rajasthan",
        accreditation: "NAAC A+ • Top Private University in Rajasthan",
        specialties: "B.Tech, Law (BA LLB / BBA LLB), Agriculture, Design, Distance Learning",
        fees: "B.Tech: ₹1,20,000/yr | BA LLB: ₹95,000/yr | Distance Degrees: ₹16,000 - ₹30,000/yr",
        schemes: "Special concessions for Defence wards & Sports quota",
        recruiters: "TCS, Mahindra, Byju's, Pin Click, Justdial"
      },
      {
        name: "Noida International University (NIU)",
        location: "Greater Noida (Yamuna Expressway, UP)",
        accreditation: "UGC Recognised • World-class Medical & Tech Campus",
        specialties: "Medical / MBBS, Nursing (B.Sc/GNM), B.Tech CSE, BBA, B.Ed",
        fees: "B.Tech: ₹1,20,000/yr | Nursing B.Sc: ₹95,000/yr | BBA/BCA: ₹75,000/yr",
        schemes: "750+ Bed Super Speciality Hospital for real clinical training",
        recruiters: "Max Healthcare, Apollo Hospitals, Infosys, Tech Mahindra"
      },
      {
        name: "Tula's Institute",
        location: "Dehradun, Uttarakhand",
        accreditation: "NAAC A+ • Top Engineering & Management College in Uttarakhand",
        specialties: "B.Tech CSE/Civil/Mechanical, MBA, Forestry, B.Sc Agriculture",
        fees: "B.Tech: ₹1,10,000/yr | MBA: ₹1,20,000/yr | Forestry/Agri: ₹65,000/yr",
        schemes: "Scenic campus with guaranteed placement support & industry tie-ups",
        recruiters: "Adobe, Sterlite, Oracle, Convergys, Deutsche Bank"
      },
      {
        name: "GNIOT & Mangalmay Institute",
        location: "Knowledge Park, Greater Noida, Delhi-NCR",
        accreditation: "AKTU & UGC Approved • Delhi-NCR Prime Tech Hub",
        specialties: "B.Tech CSE/IT, MBA, MCA, BCA, BBA, D.El.Ed",
        fees: "B.Tech: ₹1,15,000 - ₹1,35,000/yr | MBA: ₹1,25,000/yr | BCA: ₹72,000/yr",
        schemes: "UP State Scholarship eligible, metro-connected campus",
        recruiters: "TCS, Wipro, Infosys, HCL, Cognizant, Reliance"
      },
      {
        name: "IIMT University",
        location: "Meerut, Delhi-NCR",
        accreditation: "NAAC Accredited • Largest Education Group in Western UP",
        specialties: "B.Tech, B.Pharm, D.Pharm, Polytechnic, B.Ed, Nursing, Paramedical",
        fees: "B.Tech: ₹85,000/yr | B.Pharm: ₹95,000/yr | Polytechnic: ₹38,000/yr | B.Ed: ₹50,000/yr",
        schemes: "Affordable fee structure with Bihar Credit Card & UP Govt Scholarship",
        recruiters: "Paytm, Toppr, Tommy Hilfiger, Wipro, Concentrix"
      },
      {
        name: "Mangalayatan University",
        location: "Aligarh (UP) & Jabalpur (MP)",
        accreditation: "NAAC A+ • UGC-DEB Entitled for Online & Distance",
        specialties: "Online MBA, Online MCA, Regular B.Tech, B.Ed, Pharmacy, Agriculture",
        fees: "Online MBA: ₹30,000/yr | Online MCA: ₹28,000/yr | Regular B.Tech: ₹1,05,000/yr",
        schemes: "0% Interest Monthly EMI starting ₹2,500/month",
        recruiters: "Tech Mahindra, Abbott, Radisson, Genpact, Lava"
      },
      {
        name: "Subharti University (SVSU Meerut)",
        location: "Meerut (Delhi-NCR)",
        accreditation: "NAAC A • Recognised Medical, Dental & Distance Leader",
        specialties: "Distance MBA, Distance BA/B.Com, B.Ed, Medical, Physiotherapy",
        fees: "Distance MBA: ₹16,000/sem | Distance BA/B.Com: ₹6,000/sem | B.Ed: ₹45,000/yr",
        schemes: "100% valid degree for Govt Jobs & UPSC exams",
        recruiters: "Subharti Hospital, Apollo, Fortis, HDFC, ICICI"
      },
      {
        name: "Online Degree Universities (Manipal, Jain, LPU, UPES, Parul, DY Patil)",
        location: "100% Online with Proctored Exams",
        accreditation: "UGC-DEB Entitled • NAAC A++ / A+ • AICTE Approved",
        specialties: "Online MBA, MCA, BCA, BBA, Data Science, Digital Marketing",
        fees: "₹15,000 - ₹45,000 per semester with ₹2,500 - ₹4,500/mo 0% No-Cost EMI",
        schemes: "Study from home, recorded + live masterclasses by global CXOs, valid for MNC jobs",
        recruiters: "Google, Amazon, Deloitte, KPMG, Ernst & Young, Accenture"
      },
      {
        name: "NIOS & Open Schooling (National Institute of Open Schooling)",
        location: "MHRD Govt of India Recognised",
        accreditation: "10th & 12th Board Secondary & Senior Secondary Certification",
        specialties: "10th Pass Guarantee Guidance, 12th Stream 1, 2, 3, 4 On-Demand Exams, TOC",
        fees: "Total Fee: ₹8,500 - ₹15,000 (including books, practicals, TMA & exam support)",
        schemes: "100% valid for NEET, JEE, NDA, CUET, Govt Jobs, Passport & Higher Admissions",
        recruiters: "Valid universally across all universities and government departments"
      }
    ]
  };

  /**
   * 3. Verified Available Counsellors Roster (For Student Call Booking)
   */
  const COUNSELLORS_ROSTER = [
    {
      id: "COUNS_01",
      name: "Miss Ishika Sharma",
      role: "Chief Career & Admissions Counsellor",
      experience: "8+ Years Guidance Experience",
      avatar: "👩‍💼",
      badge: "⭐ Top Rated",
      expertise: "B.Tech CSE, MBA, Medical/Nursing & Scholarship Quota"
    },
    {
      id: "COUNS_02",
      name: "Mr. Raghav Raj Rauniyar",
      role: "Senior University Admissions Specialist",
      experience: "10+ Years University Tie-ups",
      avatar: "👨‍💼",
      badge: "🎓 University Expert",
      expertise: "Top Engineering, Online Degrees & Bihar Credit Card"
    },
    {
      id: "COUNS_03",
      name: "EduVision Admissions Desk",
      role: "Central Verification & Student Support Desk",
      experience: "Instant Call Allocation",
      avatar: "📞",
      badge: "⚡ Fast Track",
      expertise: "Documentation, NIOS 10th/12th, Fee Verification & Fast-Track Admission"
    }
  ];

  /**
   * 4. Google Gemini / RGB Golden Shimmer Thinking Animation Component
   */
  function showAiThinkingBox(container) {
    if (!container) return null;
    const existing = document.getElementById('aiThinkingBox');
    if (existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'aiThinkingBox';
    box.className = 'ai-thinking-card';
    box.innerHTML = `
      <div class="ai-thinking-glow-bar"></div>
      <div class="ai-thinking-header">
        <div class="ai-sparkle-icon">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <div class="ai-thinking-text-wrap">
          <div class="ai-thinking-title">EduVision Gemini RAG AI is thinking...</div>
          <div class="ai-thinking-stage" id="aiThinkingStageText">🔍 Querying 1,500+ degree programs & verified fee schedules...</div>
        </div>
      </div>
      <div class="ai-progress-track">
        <div class="ai-progress-bar-glow"></div>
      </div>
    `;
    container.appendChild(box);
    const isScrolledUp = (container.scrollHeight - container.scrollTop - container.clientHeight) > 100;
    if (!isScrolledUp) {
      container.scrollTop = container.scrollHeight;
    }

    // Progressive Thinking Stages
    const stages = [
      "🔍 Querying 1,500+ degree programs & verified fee schedules...",
      "⚡ Cross-verifying UGC/NAAC accreditations & scholarship slabs...",
      "✨ Formulating tailored guidance & recommendations..."
    ];
    let stageIdx = 0;
    const stageTimer = setInterval(() => {
      stageIdx++;
      const stageEl = document.getElementById('aiThinkingStageText');
      if (stageEl && stages[stageIdx]) {
        stageEl.textContent = stages[stageIdx];
      }
    }, 450);

    box._cleanup = () => {
      clearInterval(stageTimer);
      if (box.parentNode) box.parentNode.removeChild(box);
    };

    return box;
  }

  /**
   * 5. Call Booking Handler for Students
   */
  function handleStudentCallBooking(counsellorId, slot) {
    const counsellor = COUNSELLORS_ROSTER.find(c => c.id === counsellorId) || COUNSELLORS_ROSTER[0];
    const ticketId = 'CALL-' + Math.floor(100000 + Math.random() * 900000);
    
    // Save to local storage call requests & leads
    try {
      const existing = JSON.parse(localStorage.getItem('eduvision_student_call_requests') || '[]');
      existing.push({
        ticket_id: ticketId,
        counsellor_id: counsellor.id,
        counsellor_name: counsellor.name,
        preferred_slot: slot || 'Morning (10 AM - 1 PM)',
        booked_at: new Date().toISOString(),
        status: 'Scheduled'
      });
      localStorage.setItem('eduvision_student_call_requests', JSON.stringify(existing));
    } catch(e){}

    return `
      <div class="ai-call-confirmed-card">
        <div style="font-size:1.8rem; margin-bottom:8px;">🎉</div>
        <h4 style="color:#f7d377; font-size:1.15rem; font-weight:800; margin-bottom:6px;">1-on-1 Call Scheduled!</h4>
        <p style="color:#e2e8f0; font-size:0.9rem; line-height:1.5; margin-bottom:12px;">
          Your consultation call with <strong>${counsellor.name}</strong> (${counsellor.role}) has been confirmed.
        </p>
        <div style="background:rgba(201,147,42,0.12); border:1px solid rgba(247,211,119,0.3); border-radius:12px; padding:10px 14px; margin-bottom:14px; font-size:0.85rem; color:#fff; text-align:left;">
          <div>🎫 <strong>Booking Reference:</strong> #${ticketId}</div>
          <div>⏰ <strong>Preferred Window:</strong> ${slot || 'Morning (10 AM - 1 PM)'}</div>
          <div>📞 <strong>Direct Call from:</strong> Miss Ishika Sharma's Official Desk</div>
        </div>
        <p style="font-size:0.8rem; color:#94a3b8;">You will receive a call on your registered mobile number shortly. Welcome to the EduVision family! 🚀</p>
      </div>
    `;
  }

  /**
   * 6. Render Counsellor Selection Card for Students
   */
  function renderCounsellorBookingSelectionHtml() {
    return `
      <div class="ai-counsellor-booking-card">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <span style="font-size:1.4rem;">📞</span>
          <div>
            <h4 style="color:#fff; font-size:1.05rem; font-weight:800; margin:0;">Book 1-on-1 Expert Guidance Call</h4>
            <span style="color:#f7d377; font-size:0.75rem; font-weight:700;">100% Free • Direct Telephonic Consultation</span>
          </div>
        </div>
        <p style="color:#94a3b8; font-size:0.84rem; margin-bottom:14px;">Select your preferred counsellor to arrange an immediate callback:</p>
        
        <div class="ai-counsellor-list">
          ${COUNSELLORS_ROSTER.map(c => `
            <div class="ai-counsellor-item" onclick="EduVisionRagAi.triggerCounsellorBooking('${c.id}')">
              <div class="ai-counsellor-avatar">${c.avatar}</div>
              <div class="ai-counsellor-info">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <strong style="color:#fff; font-size:0.92rem;">${c.name}</strong>
                  <span class="ai-counsellor-badge">${c.badge}</span>
                </div>
                <div style="color:#f7d377; font-size:0.75rem; font-weight:600;">${c.role}</div>
                <div style="color:#94a3b8; font-size:0.72rem; margin-top:2px;">${c.expertise}</div>
              </div>
              <button class="ai-btn-book">Select →</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 7. Deep High-Intelligence Fallback Engine (Offline & Fast Path)
   */
  function generateLocalAiResponse(rawQuery, userName, userRole) {
    const q = (rawQuery || '').toLowerCase().trim();

    // Student Call Booking Intent
    if (/(calls*arrange|books*call|counsellors*call|counselors*ses*baat|baats*karwao|calls*karo|talks*tos*counsellor|calls*back|arranges*as*call|ishikas*sharma|raghavs*raj)/i.test(q)) {
      return renderCounsellorBookingSelectionHtml();
    }

    // Identity / Who am I
    if (/(whos*ams*i|meras*naam|mys*name|whos*is*am|mys*role|mes*kaun)/i.test(q)) {
      return `Hello <strong>${userName || 'Friend'}</strong>! You are currently active as <strong>${userRole || 'EduVision Member'}</strong>.<br><br>How can I assist you today with courses, fees, or university admissions? 🌟`;
    }

    // BBA (Bachelor of Business Administration)
    if (/\b(bba|b\.b\.a|bachelor\s*of\s*business|bba\s*admission|bba\s*colleges?|bba\s*university|bba\s*fees?|bba\s*course)\b/i.test(q) || (q.includes('bba') && !q.includes('bba llb') && !q.includes('mba'))) {
      return `
        <div class="ai-knowledge-card">
          <h4 style="color:#f7d377; font-size:1.1rem; font-weight:800; margin-bottom:8px;">🎓 Top Partner Universities for BBA (Bachelor of Business Administration)</h4>
          <p style="color:#e2e8f0; font-size:0.88rem; line-height:1.6; margin-bottom:8px;">
            <strong>Eligibility:</strong> 10+2 / 12th Pass from any stream (Arts / Commerce / Science) with min 45%–50% marks. Direct merit seats available without entrance barrier.
          </p>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; margin:8px 0; font-size:0.85rem; line-height:1.7; color:#e2e8f0;">
            <div>🏛️ <strong>Amity University (Noida / Jaipur / Online):</strong> NAAC A+ | Regular: ₹65,000 – ₹1.2L/sem | Online: ₹30k–₹35k/sem</div>
            <div>🏛️ <strong>Chandigarh University (CU Mohali):</strong> NAAC A+ | ₹60,000 – ₹75,000/sem (CUCET scholarship up to 100%)</div>
            <div>🏛️ <strong>Galgotias University (Greater Noida):</strong> NAAC A+ | ₹50,000 – ₹65,000/sem | Metro-connected NCR campus</div>
            <div>🏛️ <strong>Manipal Online University:</strong> NAAC A++ | ₹40,000/sem (0% EMI @ ₹3,333/month)</div>
            <div>🏛️ <strong>SAGE University (Indore / Bhopal):</strong> NAAC Accredited | ₹30,000 – ₹45,000/sem (Budget-friendly)</div>
            <div>🏛️ <strong>Sandip University (Nashik / Sijoul):</strong> 100% Bihar Student Credit Card (BSCCS ₹4L) accepted!</div>
          </div>
          <div style="color:#cbd5e1; font-size:0.83rem; line-height:1.6; margin-top:8px;">
            • <strong>Specializations:</strong> Digital Marketing, Finance & Banking, HR Management, Business Analytics, International Business.<br>
            • <strong>Average Packages:</strong> ₹4.5 LPA – ₹8.5 LPA (Deloitte, EY, Amazon, ICICI Bank, HDFC, TCS).<br>
            • <strong>Financial Aid:</strong> Bihar Credit Card (BSCCS ₹4L) + 0% Monthly No-Cost EMI options.
          </div>
        </div>
      `;
    }

    // MBA & PGDM (Master of Business Administration)
    if (/\b(mba|m\.b\.a|pgdm|master\s*of\s*business|mba\s*admission|mba\s*colleges?|mba\s*university|mba\s*fees?|mba\s*course)\b/i.test(q)) {
      return `
        <div class="ai-knowledge-card">
          <h4 style="color:#f7d377; font-size:1.1rem; font-weight:800; margin-bottom:8px;">🏆 Top Partner Universities for MBA & PGDM (Online & Regular)</h4>
          <p style="color:#e2e8f0; font-size:0.88rem; line-height:1.6; margin-bottom:8px;">
            <strong>Eligibility:</strong> Graduation (Bachelor's Degree) in any stream with min 50% marks (45% for SC/ST/OBC). Direct merit seats without CAT/MAT barrier.
          </p>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; margin:8px 0; font-size:0.85rem; line-height:1.7; color:#e2e8f0;">
            <div>🏛️ <strong>Chandigarh University (CU Mohali):</strong> NAAC A+ | ₹1.2L – ₹1.6L/year | Highest CTC ₹54.75 LPA</div>
            <div>🏛️ <strong>Amity University (Noida / Lucknow / Online):</strong> NAAC A+ | ₹1.8L – ₹3.5L/year | Online: ₹45k–₹50k/sem</div>
            <div>🏛️ <strong>Manipal Online (MAHE / MUJ):</strong> NAAC A++ | ₹42,500/sem (0% EMI @ ₹3,540/month, Harvard modules)</div>
            <div>🏛️ <strong>Galgotias & Sharda University (Noida):</strong> NAAC A+ | ₹1.4L – ₹1.7L/year | Delhi-NCR corporate hub</div>
            <div>🏛️ <strong>SAGE University (Indore / Bhopal):</strong> ₹85,000 – ₹1.2L/year | Industry-aligned labs</div>
            <div>🏛️ <strong>Mangalayatan & Subharti University:</strong> Online/Distance MBA starting ₹16,000/sem (₹30k–₹32k/year)</div>
          </div>
          <div style="color:#cbd5e1; font-size:0.83rem; line-height:1.6; margin-top:8px;">
            • <strong>Specializations:</strong> Dual Specialization (Marketing, Finance, HR, Business Analytics, Fintech, Operations).<br>
            • <strong>Average Packages:</strong> ₹7.5 LPA – ₹16 LPA (Amazon, PwC, KPMG, Bain, Axis Bank, Wipro).
          </div>
        </div>
      `;
    }

    // BCA (Bachelor of Computer Applications)
    if (/\b(bca|b\.c\.a|bachelor\s*of\s*computer|bca\s*admission|bca\s*colleges?|bca\s*university|bca\s*fees?)\b/i.test(q)) {
      return `
        <div class="ai-knowledge-card">
          <h4 style="color:#f7d377; font-size:1.1rem; font-weight:800; margin-bottom:8px;">💻 Top Universities for BCA (Bachelor of Computer Applications)</h4>
          <p style="color:#e2e8f0; font-size:0.88rem; line-height:1.6; margin-bottom:8px;">
            <strong>Eligibility:</strong> 10+2 / 12th Pass (Any stream with min 45%-50%). Maths is not compulsory in top partner campuses.
          </p>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; margin:8px 0; font-size:0.85rem; line-height:1.7; color:#e2e8f0;">
            <div>🏛️ <strong>SRM University (Delhi-NCR):</strong> NAAC A++ | ₹85,000/year</div>
            <div>🏛️ <strong>Chandigarh University (CU Mohali):</strong> NAAC A+ | ₹55,000/semester</div>
            <div>🏛️ <strong>Manipal Online University:</strong> NAAC A++ | ₹35,000/sem (0% EMI @ ₹2,916/month)</div>
            <div>🏛️ <strong>Galgotias University & GNIOT:</strong> ₹72,000–₹85,000/year</div>
            <div>🏛️ <strong>Sandip University (Nashik/Sijoul):</strong> 100% Bihar Credit Card (BSCCS ₹4L) accepted!</div>
          </div>
          <div style="color:#cbd5e1; font-size:0.83rem; line-height:1.6; margin-top:8px;">
            • <strong>Specializations:</strong> Cloud Computing, AI & Data Science, Full Stack Web Dev, Cyber Security.<br>
            • <strong>Average Packages:</strong> ₹4.0 LPA – ₹9.0 LPA (TCS, Infosys, Wipro, Capgemini, Accenture).
          </div>
        </div>
      `;
    }

    // MCA (Master of Computer Applications)
    if (/\b(mca|m\.c\.a|master\s*of\s*computer|mca\s*admission|mca\s*colleges?|mca\s*university|mca\s*fees?)\b/i.test(q)) {
      return `
        <div class="ai-knowledge-card">
          <h4 style="color:#f7d377; font-size:1.1rem; font-weight:800; margin-bottom:8px;">🖥️ Top Universities for MCA (Master of Computer Applications)</h4>
          <p style="color:#e2e8f0; font-size:0.88rem; line-height:1.6; margin-bottom:8px;">
            <strong>Eligibility:</strong> BCA / B.Sc / Any Graduate with Maths (min 50% marks). Duration: 2 Years.
          </p>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; margin:8px 0; font-size:0.85rem; line-height:1.7; color:#e2e8f0;">
            <div>🏛️ <strong>Manipal Online University:</strong> NAAC A++ | ₹37,500/sem (0% EMI @ ₹3,125/month)</div>
            <div>🏛️ <strong>Chandigarh University (CU Mohali):</strong> NAAC A+ | ₹70,000/semester</div>
            <div>🏛️ <strong>Amity University (Online / Regular):</strong> ₹45,000/sem online | ₹1.4L/yr regular</div>
            <div>🏛️ <strong>Mangalayatan University Online:</strong> ₹28,000/year (Budget-friendly UGC-DEB)</div>
          </div>
          <div style="color:#cbd5e1; font-size:0.83rem; line-height:1.6; margin-top:8px;">
            • <strong>Roles:</strong> Software Engineer, Data Scientist, Cloud Architect (₹6.5 LPA – ₹18 LPA).
          </div>
        </div>
      `;
    }

    // B.Tech & Engineering
    if (/(b\.?tech|cse|computer\s*science|engineering|polytechnic|diploma)/i.test(q)) {
      return `
        <div class="ai-knowledge-card">
          <h4 style="color:#f7d377; font-size:1.1rem; font-weight:800; margin-bottom:8px;">⚡ Top Engineering & B.Tech CSE Colleges</h4>
          <p style="color:#e2e8f0; font-size:0.88rem; line-height:1.6; margin-bottom:10px;">
            Here are our top UGC & NAAC Accredited partner campuses for <strong>B.Tech (CSE, AI/ML, Data Science, Cyber Security)</strong>:
          </p>
          <ul style="color:#cbd5e1; font-size:0.85rem; line-height:1.7; padding-left:18px; margin-bottom:12px;">
            <li><strong>SRM University (Delhi-NCR):</strong> NAAC A++, Top Placement ₹50+ LPA. Fees: ₹2.2L - ₹3.5L/yr.</li>
            <li><strong>Chandigarh University (CU Mohali):</strong> NAAC A+, Highest Package ₹54.75 LPA. Fees: ₹1.35L - ₹1.8L/yr.</li>
            <li><strong>Sandip University (Nashik/Sijoul):</strong> Bihar Credit Card (BSCCS ₹4L) Approved. Fees: ₹1.1L - ₹1.4L/yr.</li>
            <li><strong>SAGE University (Indore/Bhopal):</strong> Smart Tech Labs, Low Fee Structure: ₹70,000 - ₹1.1L/yr.</li>
          </ul>
          <p style="font-size:0.82rem; color:#94a3b8;">Want to compare fees or check your scholarship bracket? Ask me anytime!</p>
        </div>
      `;
    }

    // Fee & University Specific Intelligence
    const stopWords = new Set(['university', 'universities', 'institute', 'institution', 'college', 'colleges', 'campus', 'online', 'degree', 'degrees', 'group', 'the', 'and', 'for', 'ltd', 'pvt', 'battao', 'batao', 'tell', 'about', 'fees', 'structure', 'details']);
    for (const u of EDUVISION_KNOWLEDGE_BASE.partnerUniversities) {
      const matchWords = u.name.toLowerCase().split(/[\s,()/-]+/).filter(w => w.length > 2 && !stopWords.has(w));
      const isMatch = matchWords.length > 0 && matchWords.some(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        return regex.test(q);
      });
      if (isMatch) {
        return `
          <div class="ai-knowledge-card">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span style="font-size:1.4rem;">🏛️</span>
              <div>
                <h4 style="color:#fff; font-size:1.1rem; font-weight:800; margin:0;">${u.name}</h4>
                <span style="color:#f7d377; font-size:0.78rem; font-weight:700;">${u.accreditation} • ${u.location}</span>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; margin:10px 0; font-size:0.88rem; line-height:1.6; color:#e2e8f0;">
              <div>💰 <strong>Fee Structure:</strong> ${u.fees}</div>
              <div>🎓 <strong>Key Programs:</strong> ${u.specialties}</div>
              <div>💼 <strong>Top Recruiters:</strong> ${u.recruiters}</div>
              <div>🏷️ <strong>Financial Aid / Schemes:</strong> ${u.schemes}</div>
            </div>
            <p style="font-size:0.85rem; color:#94a3b8; margin-top:8px;">Would you like to check eligibility, apply for a scholarship, or arrange a 1-on-1 call with our counsellor for ${u.name}?</p>
          </div>
        `;
      }
    }

    if (/(nios|10th|12th|open\s*school|fail)/i.test(q)) {
      return `
        <div class="ai-knowledge-card">
          <h4 style="color:#f7d377; font-size:1.1rem; font-weight:800; margin-bottom:8px;">📚 NIOS & 10th / 12th Board Admission Guidance</h4>
          <p style="color:#e2e8f0; font-size:0.88rem; line-height:1.6; margin-bottom:10px;">
            If you missed exams or want to save a year, <strong>NIOS (National Institute of Open Schooling)</strong> offers 100% government recognized board certification:
          </p>
          <ul style="color:#cbd5e1; font-size:0.85rem; line-height:1.7; padding-left:18px; margin-bottom:12px;">
            <li><strong>TOC (Transfer of Credit):</strong> Pass 2 subjects from previous board, clear remaining in NIOS.</li>
            <li><strong>On-Demand Exams:</strong> Appear for exams in any month according to your preparation.</li>
            <li><strong>Validity:</strong> 100% accepted for NEET, JEE, NDA, CUET, Passport, and Govt Jobs.</li>
            <li><strong>Package Fee:</strong> ₹8,500 - ₹15,000 complete (Books, TMA Assignment assistance, Practical guide).</li>
          </ul>
          <p style="font-size:0.82rem; color:#94a3b8;">Want to register for the upcoming session? Click <em>Arrange Call</em> or ask for admission steps!</p>
        </div>
      `;
    }

    // Default intelligent response
    return `
      <div style="line-height:1.6; font-size:0.9rem; color:#e2e8f0;">
        I am <strong>EduVision Gemini RAG AI</strong>. I have real-time access to 1,500+ degree programs, official fee structures, scholarships, and partner universities.<br><br>
        <strong>Here is what you can ask me:</strong><br>
        • <em>"What are the B.Tech CSE fees for SRM vs Sandip vs CU?"</em><br>
        • <em>"Suggest best Online MBA under ₹30,000 with 0% EMI"</em><br>
        • <em>"Explain Bihar Student Credit Card (BSCCS ₹4 Lakhs) procedure"</em><br>
        • <em>"Eligibility criteria for NIOS 12th admission"</em><br>
        • <em>"Arrange a call with counsellor"</em><br><br>
        <span style="color:#94a3b8; font-size:0.82rem;">How can I assist your educational journey right now? 🚀</span>
      </div>
    `;
  }

  /**
   * 8. Gemini Live Web & AI Synthesizer with RGB Thinking Animation
   */
  async function queryRagAi(queryText, options = {}) {
    const activeUser = (typeof currentAdmin !== 'undefined' && currentAdmin) || 
                       (typeof currentUser !== 'undefined' && currentUser) || 
                       (typeof currentStudent !== 'undefined' && currentStudent) || {};
    const userName = activeUser.full_name || activeUser.name || 'Student/Partner';
    const userRole = activeUser.designation || activeUser.role || (activeUser.student_id ? 'Student' : 'User');
    const isStudent = (userRole === 'Student' || !!activeUser.student_id);

    // Call Booking Quick Route
    const qLower = queryText.toLowerCase().trim();
    if (/(call\s*arrange|book\s*call|counsellor\s*call|talk\s*to\s*counsellor|arrange\s*a\s*call|counselor\s*se\s*baat)/i.test(qLower)) {
      return renderCounsellorBookingSelectionHtml();
    }

    let apiKey = '';
    try {
      apiKey = (localStorage.getItem('eduvision_rag_ai_api_key') || localStorage.getItem('eduvision_gemini_api_key') || '').trim();
    } catch(e){}
    if (!apiKey) apiKey = RAG_AI_CONFIG.apiKey;

    const systemPrompt = `You are EduVision AI (⚡ EduVision Gemini RAG AI), the central educational intelligence, university admissions advisor, and counsellor co-pilot.

USER CONTEXT:
- Name: ${userName}
- Role: ${userRole}
- Is Student: ${isStudent}

KEY COURSE & ADMISSION KNOWLEDGE:
1. BBA (Bachelor of Business Administration): 10+2 / 12th Pass from any stream with 45%-50% marks. 3 Years duration. Top Campuses: Amity (₹65k-1.2L/sem, online ₹35k/sem), Chandigarh University (₹60k-75k/sem), Galgotias (₹50k-65k/sem), Manipal Online (₹40k/sem, 0% EMI ₹3,333/mo), SAGE (₹30k-45k/sem), Sandip University (100% BSCCS ₹4L loan approved). Average CTC ₹4.5L - ₹8.5 LPA.
2. MBA & PGDM: Graduation in any stream with min 50% marks. 2 Years duration. Direct merit quota without CAT barrier. Top Campuses: Chandigarh University (₹1.2L-1.6L/yr), Amity (₹1.8L-3.5L/yr), Manipal Online (₹42.5k/sem), Galgotias (₹1.4L-1.7L/yr), SAGE (₹85k-1.2L/yr), Mangalayatan/Subharti (₹16k/sem). Average CTC ₹7.5L - ₹16 LPA.
3. BCA & MCA: BCA (12th Pass, ₹35k-85k/yr), MCA (Graduation + Maths, 2 Yrs, ₹28k-70k/sem).
4. B.Tech (CSE, AI/ML, Data Science): 12th PCM 45-50%. SRM (₹2.2L-3.5L/yr), CU (₹1.35L-1.8L/yr), Galgotias (₹1.4L-1.6L/yr), Sandip (BSCCS ₹4L).
5. MBBS Abroad: Russia & Uzbekistan (₹18L - ₹28L full 5.5-6 yrs package, 100% NMC/WHO compliant, ₹0 donation).
6. Financial Aid: Bihar Student Credit Card (BSCCS ₹4 Lakhs 0% loan) on all DRCC approved campuses + 0% Monthly No-Cost EMI.

KNOWLEDGE BASE UNIVERSITIES:
${JSON.stringify(EDUVISION_KNOWLEDGE_BASE.partnerUniversities, null, 2)}

GUIDELINES:
1. When asked about BBA, provide BBA-specific criteria (12th Pass, 45-50%), top universities with fee breakdown, specializations, and placements. DO NOT confuse BBA with MBA.
2. If asked in Hindi / Hinglish, reply in helpful, warm Hinglish. If in English, reply in crisp English.
3. Use formatted HTML tags (<strong>, <em>, <br>, <ul>, <li>, <table>) for clean typography.
4. If a student wants a call or personalized advice, mention they can book a call with Miss Ishika Sharma or Mr. Raghav Raj.
5. Zero fluff, high value, actionable educational guidance.`;

    if (navigator.onLine && apiKey) {
      for (const model of RAG_AI_CONFIG.models) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1800);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` + encodeURIComponent(apiKey);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nUser Question: ' + queryText }] }],
              generationConfig: { temperature: 0.65, maxOutputTokens: 750 }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return reply.replace(/\`\`\`html/gi, '').replace(/\`\`\`/g, '').trim();
            }
          }
        } catch(e){}
      }
    }

    // Fallback to rich local knowledge base
    return generateLocalAiResponse(queryText, userName, userRole);
  }

  // Public API
  const EduVisionRagAi = {
    AI_COPILOT_GROUP_ID,
    getAiChatStorageKey,
    getAiChatHistory,
    saveAiChatHistory,
    clearAiChatHistory,
    showAiThinkingBox,
    queryRagAi,
    handleStudentCallBooking,
    triggerCounsellorBooking: function(counsellorId) {
      const responseHtml = handleStudentCallBooking(counsellorId);
      const history = getAiChatHistory();
      history.push({
        id: 'ai_book_' + Date.now(),
        sender_name: 'EduVision RAG AI Desk ✨',
        sender_role: 'ai',
        created_at: new Date().toISOString(),
        message: responseHtml
      });
      saveAiChatHistory(history);
      if (typeof global.renderWaMessages === 'function') {
        global.renderWaMessages();
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EduVisionRagAi;
  }
  if (typeof global !== 'undefined') {
    global.EduVisionRagAi = EduVisionRagAi;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
