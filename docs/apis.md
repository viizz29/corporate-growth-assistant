```markdown
# REST API Specification for Corporate Growth Application Backend

Base API prefix: `/api/v1`

---

## Module 1: Auth Module

### 1. Register User

- **Method:** POST  
- **Path:** `/api/v1/auth/register`  
- **Description:** Register a new user account and send email verification.  
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (201):**
  ```json
  {
    "message": "Account created successfully. Please check your email to verify your account."
  }
  ```

---

### 2. Login User

- **Method:** POST  
- **Path:** `/api/v1/auth/login`  
- **Description:** Authenticate user. Returns JWT if 2FA disabled or OTP prompt if 2FA enabled.  
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200) - Without 2FA:**
  ```json
  {
    "token": "string (JWT)",
    "user": {
      "userId": "string (UUID)",
      "name": "string",
      "email": "string"
    }
  }
  ```
- **Response (200) - With 2FA enabled:**
  ```json
  {
    "requiresOtp": true,
    "tempToken": "string (JWT, short-lived)"
  }
  ```

---

### 3. Verify OTP for Login (Complete 2FA)

- **Method:** POST  
- **Path:** `/api/v1/auth/verify-otp-login`  
- **Description:** Complete login by verifying 2FA OTP and returning JWT token.  
- **Request Body:**
  ```json
  {
    "tempToken": "string (JWT from login step)",
    "otp": "string (6-digit code)"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "token": "string (full JWT)",
    "user": {
      "userId": "string (UUID)",
      "name": "string",
      "email": "string"
    }
  }
  ```

---

### 4. Logout

- **Method:** POST  
- **Path:** `/api/v1/auth/logout`  
- **Description:** Clear authentication cookie/session.  
- **Request Body:** None  
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "message": "Logged out successfully."
  }
  ```
- **Auth:** Required

---

### 5. Verify Email

- **Method:** POST  
- **Path:** `/api/v1/auth/verify-email`  
- **Description:** Verify email address using token from email.  
- **Request Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "message": "Email verified successfully. You can now log in."
  }
  ```

---

### 6. Resend Verification Email

- **Method:** POST  
- **Path:** `/api/v1/auth/resend-verification`  
- **Description:** Resend verification email link to user's email.  
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "message": "Verification email resent successfully. Please check your email."
  }
  ```

---

### 7. Forgot Password (Request Reset Link)

- **Method:** POST  
- **Path:** `/api/v1/auth/forgot-password`  
- **Description:** Request password reset email with secure token.  
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
  ```

---

### 8. Reset Password

- **Method:** POST  
- **Path:** `/api/v1/auth/reset-password`  
- **Description:** Reset password using token from reset email.  
- **Request Body:**
  ```json
  {
    "token": "string",
    "password": "string"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "message": "Password has been reset successfully."
  }
  ```

---

### 9. Toggle Two-Factor Authentication (2FA)

- **Method:** POST  
- **Path:** `/api/v1/auth/toggle-2fa`  
- **Description:** Enable or disable 2FA for logged in user.  
- **Request Body:**
  ```json
  {
    "enabled": true
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "message": "Two-factor authentication enabled."
  }
  ```
- **Auth:** Required

---

## Module 2: Users Module

### 1. Get Own User Profile

- **Method:** GET  
- **Path:** `/api/v1/users/me`  
- **Description:** Retrieve authenticated user's profile details.  
- **Request Body:** None  
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "userId": "string (UUID)",
    "name": "string",
    "email": "string",
    "role": "string",
    "isEmailVerified": true,
    "is2faEnabled": false,
    "isEmailNotificationsEnabled": true,
    "languagePreference": "en" | "hi",
    "themePreference": "light" | "dark",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required (email verification bypassed)

---

### 2. Update Own User Profile

- **Method:** PATCH  
- **Path:** `/api/v1/users/me`  
- **Description:** Update user's profile fields (name, email, preferences).  
- **Request Body (all optional):**
  ```json
  {
    "name": "string",
    "email": "string",
    "languagePreference": "en" | "hi",
    "themePreference": "light" | "dark"
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):** Same as GET `/users/me` response.  
- **Auth:** Required (email verification bypassed)  
- **Errors:** 409 if email in use by another user.

---

### 3. Get Email Notification Preferences

- **Method:** GET  
- **Path:** `/api/v1/users/me/email-preferences`  
- **Description:** Retrieve current user's email notification preference.  
- **Request Body:** None  
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "emailNotifications": true
  }
  ```
- **Auth:** Required (email verification bypassed)

---

### 4. Update Email Notification Preferences

- **Method:** PUT  
- **Path:** `/api/v1/users/me/email-preferences`  
- **Description:** Update user's email notification preference.  
- **Request Body:**
  ```json
  {
    "emailNotifications": true
  }
  ```
- **Query Params:** None  
- **Path Params:** None  
- **Response (200):**
  ```json
  {
    "emailNotifications": true
  }
  ```
- **Auth:** Required (email verification bypassed)

---

### 5. Education Entries

#### Add Education

- **Method:** POST  
- **Path:** `/api/v1/users/educations`  
- **Description:** Add an education entry to user's profile.  
- **Request Body:**
  ```json
  {
    "institution": "string",
    "degree": "string (optional)",
    "fieldOfStudy": "string (optional)",
    "startDate": "string (YYYY-MM-DD, optional)",
    "endDate": "string (YYYY-MM-DD, optional)",
    "description": "string (optional)"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "string (UUID)",
    "institution": "string",
    "degree": "string",
    "fieldOfStudy": "string",
    "startDate": "string",
    "endDate": "string",
    "description": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required

#### Update Education

- **Method:** PATCH  
- **Path:** `/api/v1/users/educations/:id`  
- **Description:** Update an existing education entry.  
- **Request Body:** Same as Add Education (all optional)  
- **Response (200):** Updated education object (same shape as above)  
- **Auth:** Required  
- **Path Params:**  
  - `id`: Education entry UUID

#### Delete Education

- **Method:** DELETE  
- **Path:** `/api/v1/users/educations/:id`  
- **Description:** Delete an education record.  
- **Response (200):**
  ```json
  {
    "message": "Education entry deleted successfully."
  }
  ```
- **Auth:** Required  
- **Path Params:**  
  - `id`: Education entry UUID

---

### 6. Work Experience Entries

#### Add Work Experience

- **Method:** POST  
- **Path:** `/api/v1/users/work-experiences`  
- **Description:** Add a work experience entry to user's profile.  
- **Request Body:**
  ```json
  {
    "company": "string",
    "role": "string",
    "startDate": "string (YYYY-MM-DD, optional)",
    "endDate": "string (YYYY-MM-DD, optional)",
    "description": "string (optional)"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "string (UUID)",
    "company": "string",
    "role": "string",
    "startDate": "string",
    "endDate": "string",
    "description": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required

#### Update Work Experience

- **Method:** PATCH  
- **Path:** `/api/v1/users/work-experiences/:id`  
- **Request Body:** Same as Add Work Experience (all optional)  
- **Response (200):** Updated work experience object  
- **Auth:** Required  
- **Path Params:**  
  - `id`: Work experience entry UUID

#### Delete Work Experience

- **Method:** DELETE  
- **Path:** `/api/v1/users/work-experiences/:id`  
- **Response (200):**
  ```json
  {
    "message": "Work experience entry deleted successfully."
  }
  ```
- **Auth:** Required  
- **Path Params:**  
  - `id`: Work experience entry UUID

---

### 7. Skills

#### Add Skill

- **Method:** POST  
- **Path:** `/api/v1/users/skills`  
- **Request Body:**
  ```json
  {
    "skillName": "string",
    "proficiencyLevel": "string (optional)"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "string (UUID)",
    "skillName": "string",
    "proficiencyLevel": "string (optional)",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required

#### Update Skill

- **Method:** PATCH  
- **Path:** `/api/v1/users/skills/:id`  
- **Request Body:** Same as Add Skill (both optional)  
- **Response (200):** Updated skill object  
- **Auth:** Required  
- **Path Params:**  
  - `id`: Skill entry UUID

#### Delete Skill

- **Method:** DELETE  
- **Path:** `/api/v1/users/skills/:id`  
- **Response (200):**
  ```json
  {
    "message": "Skill entry deleted successfully."
  }
  ```
- **Auth:** Required  
- **Path Params:**  
  - `id`: Skill entry UUID

---

### 8. Projects

#### Add Project

- **Method:** POST  
- **Path:** `/api/v1/users/projects`  
- **Request Body:**
  ```json
  {
    "projectName": "string",
    "description": "string (optional)",
    "startDate": "string (YYYY-MM-DD, optional)",
    "endDate": "string (YYYY-MM-DD, optional)",
    "techStack": "string (optional)"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "string (UUID)",
    "projectName": "string",
    "description": "string",
    "startDate": "string",
    "endDate": "string",
    "techStack": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required

#### Update Project

- **Method:** PATCH  
- **Path:** `/api/v1/users/projects/:id`  
- **Request Body:** Same as Add Project (all optional)  
- **Response (200):** Updated project object  
- **Auth:** Required  
- **Path Params:**  
  - `id`: Project entry UUID

#### Delete Project

- **Method:** DELETE  
- **Path:** `/api/v1/users/projects/:id`  
- **Response (200):**
  ```json
  {
    "message": "Project entry deleted successfully."
  }
  ```
- **Auth:** Required  
- **Path Params:**  
  - `id`: Project entry UUID

---

## Module 3: Job Advertisements Module

### 1. Create Job Advertisement

- **Method:** POST  
- **Path:** `/api/v1/job-ads`  
- **Description:** Create a new job advertisement owned by the authenticated user.  
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "location": "string (optional)",
    "language": "en" | "hi"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "string (UUID)",
    "title": "string",
    "description": "string",
    "requirements": "string",
    "location": "string",
    "language": "en" | "hi",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required

---

### 2. List User's Job Advertisements

- **Method:** GET  
- **Path:** `/api/v1/job-ads`  
- **Description:** Retrieve a list of all job advertisements owned by the authenticated user.  
- **Response (200):**
  ```json
  [
    {
      "id": "string (UUID)",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "location": "string",
      "language": "en" | "hi",
      "createdAt": "ISO8601 datetime",
      "updatedAt": "ISO8601 datetime"
    }
  ]
  ```
- **Auth:** Required

---

### 3. Get Job Advertisement Details

- **Method:** GET  
- **Path:** `/api/v1/job-ads/:id`  
- **Description:** Get details of a specific job advertisement owned by the user.  
- **Path Params:**  
  - `id`: Job advertisement UUID  
- **Response (200):** Job advertisement object (same as above)  
- **Auth:** Required

---

### 4. Update Job Advertisement

- **Method:** PATCH  
- **Path:** `/api/v1/job-ads/:id`  
- **Description:** Update fields of a job advertisement.  
- **Request Body (any subset):**
  ```json
  {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "location": "string",
    "language": "en" | "hi"
  }
  ```
- **Path Params:**  
  - `id`: Job advertisement UUID  
- **Response (200):** Updated job advertisement object  
- **Auth:** Required

---

### 5. Delete Job Advertisement

- **Method:** DELETE  
- **Path:** `/api/v1/job-ads/:id`  
- **Description:** Delete a job advertisement.  
- **Path Params:**  
  - `id`: Job advertisement UUID  
- **Response (200):**
  ```json
  {
    "message": "Job advertisement deleted successfully."
  }
  ```
- **Auth:** Required

---

## Module 4: ATS Scoring Module

### 1. Compute ATS Score and Recommendations

- **Method:** POST  
- **Path:** `/api/v1/ats/score`  
- **Description:** Calculate ATS compatibility score of the authenticated user's profile against a specific job advertisement and return recommendations.  
- **Request Body:**
  ```json
  {
    "jobAdId": "string (UUID)"
  }
  ```
- **Response (200):**
  ```json
  {
    "userId": "string (UUID)",
    "jobAdId": "string (UUID)",
    "atsScore": 0.0,
    "recommendations": [
      {
        "type": "skill" | "project",
        "message": "string",
        "details": "string (optional)"
      }
    ],
    "computedAt": "ISO8601 datetime"
  }
  ```
- **Auth:** Required

---

### 2. Get Cached ATS Score (Optional)

- **Method:** GET  
- **Path:** `/api/v1/ats/score/:jobAdId`  
- **Description:** Retrieve cached ATS score and recommendations for the authenticated user and a job advertisement.  
- **Path Params:**  
  - `jobAdId`: Job advertisement UUID  
- **Response (200):** Same as POST `/ats/score` response.  
- **Auth:** Required

---

## Module 5: Resume Generation Module

### 1. List Available Resume Templates

- **Method:** GET  
- **Path:** `/api/v1/resumes/templates`  
- **Description:** List pre-built active resume templates filtered by user's language preference or all.  
- **Response (200):**
  ```json
  [
    {
      "id": "string (UUID)",
      "name": "string",
      "language": "en" | "hi",
      "isActive": true,
      "createdAt": "ISO8601 datetime",
      "updatedAt": "ISO8601 datetime"
    }
  ]
  ```
- **Auth:** Required

---

### 2. Generate Resume PDF

- **Method:** POST  
- **Path:** `/api/v1/resumes/generate`  
- **Description:** Generate a customized PDF resume based on user profile, job ad, and chosen template. Enforces ATS score threshold. Returns either a preview URL or PDF stream.  
- **Request Body:**
  ```json
  {
    "jobAdId": "string (UUID)",
    "resumeTemplateId": "string (UUID)",
    "language": "en" | "hi" (optional, defaults to user preference)
  }
  ```
- **Response (200):**
  ```json
  {
    "previewId": "string (UUID)",
    "previewUrl": "string (URL to preview PDF)",
    "generatedAt": "ISO8601 datetime",
    "atsScore": 0.0
  }
  ```
- **Auth:** Required  
- **Errors:** 403 if ATS score below threshold.

---

### 3. Get Resume Preview / Download

- **Method:** GET  
- **Path:** `/api/v1/resumes/preview/:previewId`  
- **Description:** Retrieve preview of generated resume PDF by preview/download ID.  
- **Path Params:**  
  - `previewId`: UUID of generated resume preview  
- **Response (200):**  
  - Content-Type: `application/pdf`  
  - Binary PDF stream or Base64 encoded PDF in JSON (depending on implementation).  
- **Auth:** Required

---

## Module 6: Mail/Notification Module

*(Internal module; no external REST API)*  

- Responsible for sending emails: verification, password reset, OTP, reminders.  
- Events triggered from Auth, Users, ATS modules.

---

## Module 7: Health Module

### 1. Full Health Check

- **Method:** GET  
- **Path:** `/api/health`  
- **Description:** Full health status including dependencies.  
- **Auth:** None  
- **Response (200):** JSON summary of database, Redis, memory, disk checks.

---

### 2. Liveness Probe

- **Method:** GET  
- **Path:** `/api/health/live`  
- **Description:** Simple liveness check.  
- **Auth:** None  
- **Response (200):**
  ```json
  {
    "status": "ok"
  }
  ```

---

### 3. Readiness Probe

- **Method:** GET  
- **Path:** `/api/health/ready`  
- **Description:** Check readiness (DB + Redis connectivity).  
- **Auth:** None  
- **Response (200):** JSON readiness summary.

---

## Module 8: (Optional) Chat Module (WebSocket)

- **Socket.IO Endpoint:** `/ws`  
- **Authentication:** JWT via `auth.token` or `Authorization` header on connection.  
- **Events:**    
  - `hello`: Client sends → Server responds with greeting string.  
  - `broadcast-hello`: Client sends → Server broadcasts `greetings` event to all clients.

---

# Summary

All protected endpoints require JWT auth and email verified unless specified.  
Field names in JSON are camelCase.  
Errors follow standard NestJS HTTP exception formats.

```