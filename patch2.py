import sys
import re

def patch_file(filepath, replacements, regex_replacements=None):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"Patched: {old[:30].strip()}...")
        else:
            print(f"NOT FOUND (exact): {old[:30].strip()}...")
            
    if regex_replacements:
        for pattern, new in regex_replacements:
            new_content = re.sub(pattern, new, content)
            if new_content != content:
                content = new_content
                print(f"Patched (regex): {pattern[:30].strip()}...")
            else:
                print(f"NOT FOUND (regex): {pattern[:30].strip()}...")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

file = r"c:\Users\Sakshi Gupta\OneDrive\Documents\Phase 2.0\student\dashboard.html"

replacements = [
    # FIX 1
    (
        "        // 4. If still not found, get ANY existing student record in student_profiles\n        if (!profileData) {\n          const { data } = await sb.from('student_profiles').select('*').limit(1).maybeSingle();\n          if (data) profileData = data;\n        }",
        "        // If no matching profile found, redirect to complete-profile\n        if (!profileData) {\n          window.location.replace('complete-profile.html');\n          return;\n        }"
    ),
    # FIX 2
    (
        "      if (!raw) {\n        console.warn(\"No active student session detected, checking fallback credentials...\");\n        // If testing directly or opened without session, generate a seamless session\n        const demoUser = {\n          id: 'usr_student_demo',\n          student_id: 'EDU260002',\n          name: 'Priya Sharma',\n          full_name: 'Priya Sharma',\n          email: 'student@eduvision.in',\n          phone: '+91 98765 43210',\n          role: 'student'\n        };\n        localStorage.setItem('eduvision_user', JSON.stringify(demoUser));\n        raw = JSON.stringify(demoUser);\n      }",
        "      if (!raw) {\n        window.location.replace('../login.html');\n        return;\n      }"
    ),
    # FIX 3
    (
        "dashUnivCourse.textContent = (univ && course) ? `${univ} • ${course}` : (univ || course || 'LPU • BCA');",
        "dashUnivCourse.textContent = (univ && course) ? `${univ} • ${course}` : (univ || course || 'Not Assigned');"
    ),
    # FIX 4
    (
        "const realComp = (data.profile_completion !== undefined && data.profile_completion !== null) ? data.profile_completion : 35;",
        "const realComp = (data.profile_completion !== undefined && data.profile_completion !== null) ? data.profile_completion : 0;"
    ),
    # FIX 5
    (
        "if (statApp) statApp.textContent = data.application_status || 'Submitted';",
        "if (statApp) statApp.textContent = data.application_status || 'Not Started';"
    ),
    # FIX 6
    (
        "if (statAppSub) statAppSub.textContent = data.university ? `${data.university} (${data.course || 'BCA'})` : 'University Application';",
        "if (statAppSub) statAppSub.textContent = data.university ? `${data.university} (${data.course || ''})` : 'University Application';"
    ),
    # FIX 7
    (
        "if (statAdm) statAdm.textContent = data.admission_status || 'In Progress';",
        "if (statAdm) statAdm.textContent = data.admission_status || 'Not Started';"
    ),
    # FIX 8
    (
        "if (statAdmSub) statAdmSub.textContent = 'Status: ' + (data.admission_status || 'Pending');",
        "if (statAdmSub) statAdmSub.textContent = 'Status: ' + (data.admission_status || 'Not Started');"
    ),
    # FIX 10
    (
        "const st = data.application_status || 'Submitted';",
        "const st = data.application_status || 'Not Started';"
    ),
    # FIX 12
    (
        "const userId = (userObj && (userObj.counsellor_id || userObj.employee_id || userObj.student_id || userObj.user_id || userObj.email)) || 'CNS260001';",
        "const userId = (userObj && (userObj.counsellor_id || userObj.employee_id || userObj.student_id || userObj.user_id || userObj.email)) || '';\n      if (!userId) {\n        alert('User ID not found');\n        return;\n      }"
    ),
    # FIX 13
    (
        "icon.className = isPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';",
        "icon.className = isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';"
    ),
    # FIX 14
    (
        "oninput=\"handleStudPasswordStrengthCheck()\"",
        "oninput=\"handleStudentPasswordStrengthCheck(this.value)\""
    ),
    # FIX 15
    (
        "const submitBtn = document.getElementById('btnSaveEmpPassword') || document.getElementById('studPwdSubmitBtn');",
        "const submitBtn = document.getElementById('btnSubmitStudentPassword') || document.getElementById('studPwdSubmitBtn');"
    ),
    (
        "const btnText = document.getElementById('btnSaveEmpPasswordText') || document.getElementById('studPwdBtnText');",
        "const btnText = submitBtn ? submitBtn.querySelector('span') : null;"
    ),
    
    # FIX 11 - specific lines
    ("id=\"set_student_id_badge\">EDU260002</span>", "id=\"set_student_id_badge\">Pending</span>"),
    ("var studId = u.student_id || u.id || 'EDU260002';", "var studId = u.student_id || u.id || 'Pending';"),
    ("if (idEl) idEl.textContent = 'ID: ' + (data.student_id || 'EDU260002');", "if (idEl) idEl.textContent = 'ID: ' + (data.student_id || 'Pending');"),
    ("if (dashId) dashId.textContent = data.student_id || 'EDU260002';", "if (dashId) dashId.textContent = data.student_id || 'Pending';"),
    ("if (setIdBadge) setIdBadge.textContent = data.student_id || 'EDU260002';", "if (setIdBadge) setIdBadge.textContent = data.student_id || 'Pending';"),
    ("${data.student_id || 'EDU260002'}", "${data.student_id || 'Pending'}"),
    
    (
        "        studentId = 'EDU260002'; // Fallback default",
        "        studentId = ''; // Fallback default\n      }\n      if (!studentId) return;"
    ),
    (
        "      let studentId = profile.student_id || document.getElementById('prof_student_id')?.value || 'EDU260002';",
        "      let studentId = profile.student_id || document.getElementById('prof_student_id')?.value || '';\n      if(!studentId) return showStudentVaultToast('Student ID required', 'error');"
    ),
    (
        "      if (!studentId) studentId = 'EDU260002';",
        "      if (!studentId) studentId = '';\n      if (!studentId) return;"
    )
]

regex_replacements = [
    # FIX 16
    (
        r"<!-- MOBILE SIDEBAR TOGGLE FUNCTION -->\s*<script>\s*function toggleMobileSidebar\(\) \{[\s\S]*?\}\s*</script>",
        "<!-- MOBILE SIDEBAR TOGGLE FUNCTION (Removed duplicate) -->"
    )
]

patch_file(file, replacements, regex_replacements)
