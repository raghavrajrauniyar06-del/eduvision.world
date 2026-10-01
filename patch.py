import sys

def patch_file(filepath, old_text, new_text):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"Not found in {filepath}")

# login.html patches
login_file = r"c:\Users\Sakshi Gupta\OneDrive\Documents\Phase 2.0\login.html"
patch_file(login_file, "    .dim-overlay {\n  </style>", "  </style>")

# complete-profile.html patches
profile_file = r"c:\Users\Sakshi Gupta\OneDrive\Documents\Phase 2.0\student\complete-profile.html"
patch_file(profile_file, "        let totalCount = 10; \n        \n        // Count pre-existing auth data\n        if (user.phone) filledCount++;\n        if (user.email) filledCount++;", "        let totalCount = trackedFields.length;\n        \n        // Count pre-existing auth data\n        if (user.phone) { filledCount++; totalCount++; }\n        if (user.email) { filledCount++; totalCount++; }")

patch_file(profile_file, "          submitBtn.innerHTML = 'Success! Redirecting... 🎉';\n          setTimeout(() => {\n            window.location.href = 'dashboard.html';\n          }, 800);", "          submitBtn.innerHTML = 'Success! Redirecting... 🎉';\n          user.student_id = nextId;\n          user.full_name = payload.full_name;\n          user.name = payload.full_name;\n          localStorage.setItem('eduvision_user', JSON.stringify(user));\n          setTimeout(() => {\n            window.location.href = 'dashboard.html';\n          }, 800);")

print("Done")
