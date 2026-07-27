import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        // App
        appTitle: "Corporate Growth Assistant",
        logout: "Logout",
        login: "Login",
        Dashboard: "Dashboard",
        Profile: "Profile",
        Settings: "Settings",
        "Job Advertisements": "Job Advertisements",
        "ATS Scoring": "ATS Scoring",
        "Resume Generation": "Resume Generation",
        welcomeMessage: "Welcome to your dashboard",
        yourAccountAndPreferences: "Your account and preferences",

        // Navigation & Layout
        Manage: "Manage",
        Edit: "Edit",
        Add: "Add",
        Save: "Save",
        Saving: "Saving...",
        Cancel: "Cancel",
        Back: "Back",
        Delete: "Delete",
        Deleting: "Deleting...",
        Yes: "Yes",
        OK: "OK",
        Create: "Create",
        Creating: "Creating...",
        Confirm: "Confirm",
        Actions: "Actions",
        Close: "Close",
        Download: "Download",
        BackToLogin: "Back to Login",

        // Forms
        Required: "Required",
        Name: "Name",
        Email: "Email",
        Password: "Password",
        "Confirm Password": "Confirm Password",
        Description: "Description",
        Search: "Search...",
        "No data available.": "No data available.",
        "Rows per page": "",

        // Profile
        profileUpdated: "Profile updated",
        failedToUpdateProfile: "Failed to update profile",
        emailPreferencesUpdated: "Email preferences updated",
        failedToUpdateEmailPreferences: "Failed to update email preferences",
        unnamedUser: "Unnamed User",
        Verified: "Verified",
        noName: "No Name",

        // Profile sections
        Education: "Education",
        WorkExperience: "Work Experience",
        Skills: "Skills",
        Projects: "Projects",
        "Personal Info": "Personal Info",
        Summary: "Summary",
        "noEducationEntries": "No education entries yet. Add your first education.",
        "noWorkExperienceEntries": "No work experience entries yet. Add your first entry.",
        "noSkillsEntries": "No skills yet. Add your first skill.",
        "noProjectEntries": "No projects yet. Add your first project.",

        // Validation
        invalidEmail: "Invalid email",
        "At least 8 characters": "At least 8 characters",
        "Must contain a lowercase letter": "Must contain a lowercase letter",
        "Must contain an uppercase letter": "Must contain an uppercase letter",
        "Must contain a number": "Must contain a number",
        "Must contain a special character": "Must contain a special character",
        "Passwords must match": "Passwords must match",
        "Institution is required": "Institution is required",
        "Company is required": "Company is required",
        "Role is required": "Role is required",
        "Skill name is required": "Skill name is required",
        "Project name is required": "Project name is required",
        "Title is required": "Title is required",
        "Description is required": "Description is required",
        "Requirements are required": "Requirements are required",

        // Email preferences
        emailPreferences: "Email Preferences",
        receiveEmailNotifications: "Receive email notifications",

        // 2FA
        twoFactorAuth: "Two-Factor Authentication",
        twoFactorEnabled: "Two-factor authentication enabled",
        twoFactorDisabled: "Two-factor authentication disabled",
        failedToUpdate2fa: "Failed to update two-factor authentication",
        requireOtp: "Require OTP from email when logging in",
        failedToUpdate2faSetting: "Failed to update 2FA setting",
        "2FA is enabled": "2FA is enabled",
        "Enable two-factor authentication": "Enable two-factor authentication",

        // Settings
        "Language Preference": "Language Preference",
        "Choose the language used throughout the application.":
          "Choose the language used throughout the application.",
        Language: "Language",
        English: "English",
        Hindi: "Hindi",
        "Theme Preference": "Theme Preference",
        "Switch between light and dark interface modes.":
          "Switch between light and dark interface modes.",
        Theme: "Theme",
        Light: "Light",
        Dark: "Dark",

        // Date & Misc
        Date: "Date",
        Created: "Created",
        Updated: "Updated",
        areYouSure: "Are you sure? This action cannot be undone.",
        Loading: "Loading...",

        // Auth
        "Invalid or missing verification token.":
          "Invalid or missing verification token.",
        "Verifying your email...": "Verifying your email...",
        "Your email has been verified successfully!":
          "Your email has been verified successfully!",
        "Email is already verified": "Email is already verified",
        "Failed to verify email. The link may be invalid or expired.":
          "Failed to verify email. The link may be invalid or expired.",
        "Resend Verification Email": "Resend Verification Email",
        "Enter your email and we'll resend the verification link.":
          "Enter your email and we'll resend the verification link.",
        "Verification email sent! Check your inbox.":
          "Verification email sent! Check your inbox.",
        "Failed to resend verification email":
          "Failed to resend verification email",
        "Resend Verification": "Resend Verification",
        "Forgot Password": "Forgot Password",
        "Enter your email and we'll send you a reset link.":
          "Enter your email and we'll send you a reset link.",
        "Reset link sent! Check your email.":
          "Reset link sent! Check your email.",
        "Failed to send reset email": "Failed to send reset email",
        "Send Reset Link": "Send Reset Link",
        "Reset Password": "Reset Password",
        "New Password": "New Password",
        "Confirm New Password": "Confirm New Password",
        "Your password has been successfully reset.":
          "Your password has been successfully reset.",
        "Invalid or missing reset token.":
          "Invalid or missing reset token.",
        "Request a new reset link": "Request a new reset link",
        "Failed to reset password": "Failed to reset password",
        "Two-Factor Authentication": "Two-Factor Authentication",
        "A one-time password has been sent to your email. Enter it below to complete login.":
          "A one-time password has been sent to your email. Enter it below to complete login.",
        OTP: "OTP",
        Verify: "Verify",
        "Back to Login": "Back to Login",
        Register: "Register",
        "Already have an account?": "Already have an account?",
        "Don't have an account?": "Don't have an account?",
        "Forgot Password?": "Forgot Password?",
        "Resend verification email": "Resend verification email",
        "An account with this email already exists":
          "An account with this email already exists",
        "Registration failed": "Registration failed",
        "Go to Login": "Go to Login",
        "Invalid credentials": "Invalid credentials",

        // PDF Viewer
        "PDF Viewer": "PDF Viewer",
        "Failed to load PDF": "Failed to load PDF",
        "Open in new tab": "Open in new tab",
      },
    },
    hi: {
      translation: {
        // App
        appTitle: "कॉर्पोरेट ग्रोथ असिस्टेंट",
        logout: "लॉगआउट करें",
        login: "लॉग इन करें",
        Dashboard: "डैशबोर्ड",
        Profile: "प्रोफ़ाइल",
        Settings: "सेटिंग्स",
        "Job Advertisements": "नौकरी विज्ञापन",
        "ATS Scoring": "ATS स्कोरिंग",
        "Resume Generation": "रिज़्यूमे जनरेशन",
        welcomeMessage: "आपके डैशबोर्ड में आपका स्वागत है",
        yourAccountAndPreferences: "आपका खाता और प्राथमिकताएँ",

        // Navigation & Layout
        Manage: "प्रबंधित करें",
        Edit: "संपादित करें",
        Add: "जोड़ें",
        Save: "सहेजें",
        Saving: "सहेज रहा है...",
        Cancel: "रद्द करें",
        Back: "वापस",
        Delete: "हटाएँ",
        Deleting: "हटा रहा है...",
        Yes: "हाँ",
        OK: "ठीक है",
        Create: "बनाएँ",
        Creating: "बना रहा है...",
        Confirm: "पुष्टि करें",
        Actions: "कार्रवाई",
        Close: "बंद करें",
        Download: "डाउनलोड",
        BackToLogin: "लॉगिन पर वापस जाएँ",

        // Forms
        Required: "आवश्यक",
        Name: "नाम",
        Email: "ईमेल",
        Password: "पासवर्ड",
        "Confirm Password": "पासवर्ड की पुष्टि करें",
        Description: "विवरण",
        Search: "खोजें...",
        "No data available.": "कोई डेटा उपलब्ध नहीं है।",
        "Rows per page": "",

        // Profile
        profileUpdated: "प्रोफ़ाइल अपडेट की गई",
        failedToUpdateProfile: "प्रोफ़ाइल अपडेट करने में विफल",
        emailPreferencesUpdated: "ईमेल प्राथमिकताएँ अपडेट की गईं",
        failedToUpdateEmailPreferences:
          "ईमेल प्राथमिकताएँ अपडेट करने में विफल",
        unnamedUser: "अनाम उपयोगकर्ता",
        Verified: "सत्यापित",
        noName: "कोई नाम नहीं",

        // Profile sections
        Education: "शिक्षा",
        WorkExperience: "कार्य अनुभव",
        Skills: "कौशल",
        Projects: "प्रोजेक्ट",
        "Personal Info": "व्यक्तिगत जानकारी",
        Summary: "सारांश",
        noEducationEntries:
          "अभी तक कोई शिक्षा प्रविष्टि नहीं। अपनी पहली शिक्षा जोड़ें।",
        noWorkExperienceEntries:
          "अभी तक कोई कार्य अनुभव नहीं। अपना पहला अनुभव जोड़ें।",
        noSkillsEntries:
          "अभी तक कोई कौशल नहीं। अपना पहला कौशल जोड़ें।",
        noProjectEntries:
          "अभी तक कोई प्रोजेक्ट नहीं। अपना पहला प्रोजेक्ट जोड़ें।",

        // Validation
        invalidEmail: "अमान्य ईमेल",
        "At least 8 characters": "कम से कम 8 अक्षर",
        "Must contain a lowercase letter": "एक छोटा अक्षर होना चाहिए",
        "Must contain an uppercase letter": "एक बड़ा अक्षर होना चाहिए",
        "Must contain a number": "एक संख्या होनी चाहिए",
        "Must contain a special character": "एक विशेष अक्षर होना चाहिए",
        "Passwords must match": "पासवर्ड मेल खाने चाहिए",
        "Institution is required": "संस्थान आवश्यक है",
        "Company is required": "कंपनी आवश्यक है",
        "Role is required": "भूमिका आवश्यक है",
        "Skill name is required": "कौशल का नाम आवश्यक है",
        "Project name is required": "प्रोजेक्ट का नाम आवश्यक है",
        "Title is required": "शीर्षक आवश्यक है",
        "Description is required": "विवरण आवश्यक है",
        "Requirements are required": "आवश्यकताएँ आवश्यक हैं",

        // Email preferences
        emailPreferences: "ईमेल प्राथमिकताएँ",
        receiveEmailNotifications: "ईमेल सूचनाएँ प्राप्त करें",

        // 2FA
        twoFactorAuth: "दो-कारक प्रमाणीकरण",
        twoFactorEnabled: "दो-कारक प्रमाणीकरण सक्षम किया गया",
        twoFactorDisabled: "दो-कारक प्रमाणीकरण अक्षम किया गया",
        failedToUpdate2fa: "दो-कारक प्रमाणीकरण अपडेट करने में विफल",
        requireOtp: "लॉग इन करते समय ईमेल से OTP आवश्यक करें",
        failedToUpdate2faSetting: "2FA सेटिंग अपडेट करने में विफल",
        "2FA is enabled": "2FA सक्षम है",
        "Enable two-factor authentication": "दो-कारक प्रमाणीकरण सक्षम करें",

        // Settings
        "Language Preference": "भाषा प्राथमिकता",
        "Choose the language used throughout the application.":
          "पूरे अनुप्रयोग में उपयोग की जाने वाली भाषा चुनें।",
        Language: "भाषा",
        English: "अंग्रेज़ी",
        Hindi: "हिंदी",
        "Theme Preference": "थीम प्राथमिकता",
        "Switch between light and dark interface modes.":
          "लाइट और डार्क इंटरफ़ेस मोड के बीच स्विच करें।",
        Theme: "थीम",
        Light: "लाइट",
        Dark: "डार्क",

        // Date & Misc
        Date: "तारीख",
        Created: "बनाया गया",
        Updated: "अपडेट किया गया",
        areYouSure: "क्या आपको यकीन है? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
        Loading: "लोड हो रहा है...",

        // Auth
        "Invalid or missing verification token.":
          "अमान्य या गायब सत्यापन टोकन।",
        "Verifying your email...": "आपका ईमेल सत्यापित हो रहा है...",
        "Your email has been verified successfully!":
          "आपका ईमेल सफलतापूर्वक सत्यापित हो गया!",
        "Email is already verified": "ईमेल पहले से सत्यापित है",
        "Failed to verify email. The link may be invalid or expired.":
          "ईमेल सत्यापित करने में विफल। लिंक अमान्य या समाप्त हो सकता है।",
        "Resend Verification Email": "सत्यापन ईमेल पुनः भेजें",
        "Enter your email and we'll resend the verification link.":
          "अपना ईमेल दर्ज करें और हम सत्यापन लिंक पुनः भेजेंगे।",
        "Verification email sent! Check your inbox.":
          "सत्यापन ईमेल भेजा गया! अपना इनबॉक्स देखें।",
        "Failed to resend verification email":
          "सत्यापन ईमेल पुनः भेजने में विफल",
        "Resend Verification": "सत्यापन पुनः भेजें",
        "Forgot Password": "पासवर्ड भूल गए",
        "Enter your email and we'll send you a reset link.":
          "अपना ईमेल दर्ज करें और हम आपको रीसेट लिंक भेजेंगे।",
        "Reset link sent! Check your email.":
          "रीसेट लिंक भेजा गया! अपना ईमेल देखें।",
        "Failed to send reset email": "रीसेट ईमेल भेजने में विफल",
        "Send Reset Link": "रीसेट लिंक भेजें",
        "Reset Password": "पासवर्ड रीसेट करें",
        "New Password": "नया पासवर्ड",
        "Confirm New Password": "नए पासवर्ड की पुष्टि करें",
        "Your password has been successfully reset.":
          "आपका पासवर्ड सफलतापूर्वक रीसेट हो गया।",
        "Invalid or missing reset token.":
          "अमान्य या गायब रीसेट टोकन।",
        "Request a new reset link": "नया रीसेट लिंक अनुरोध करें",
        "Failed to reset password": "पासवर्ड रीसेट करने में विफल",
        "Two-Factor Authentication": "दो-कारक प्रमाणीकरण",
        "A one-time password has been sent to your email. Enter it below to complete login.":
          "आपके ईमेल पर एक बार का पासवर्ड भेजा गया है। लॉगिन पूरा करने के लिए नीचे दर्ज करें।",
        OTP: "OTP",
        Verify: "सत्यापित करें",
        "Back to Login": "लॉगिन पर वापस जाएँ",
        Register: "रजिस्टर करें",
        "Already have an account?": "पहले से खाता है?",
        "Don't have an account?": "खाता नहीं है?",
        "Forgot Password?": "पासवर्ड भूल गए?",
        "Resend verification email": "सत्यापन ईमेल पुनः भेजें",
        "An account with this email already exists":
          "इस ईमेल से एक खाता पहले से मौजूद है",
        "Registration failed": "पंजीकरण विफल",
        "Go to Login": "लॉगिन पर जाएँ",
        "Invalid credentials": "अमान्य प्रमाण-पत्र",

        // PDF Viewer
        "PDF Viewer": "PDF व्यूअर",
        "Failed to load PDF": "PDF लोड करने में विफल",
        "Open in new tab": "नए टैब में खोलें",
      },
    },
  },
  fallbackLng: "en",
});

export default i18n;
