```markdown
# Database Design Specification

## Tables

---

### 1. users (existing)

| Column                          | Type               | Nullable | Default                  | Description                      |
|--------------------------------|--------------------|----------|--------------------------|----------------------------------|
| user_id                        | UUID               | No       | gen_random_uuid()        | Primary key                      |
| name                           | VARCHAR(255)       | No       | -                        | Display name                    |
| email                          | VARCHAR(255)       | No       | -                        | Unique email address            |
| password_hash                  | VARCHAR(255)       | No       | -                        | Bcrypt hashed password          |
| role                           | VARCHAR(50)        | No       | 'user'                   | User role                      |
| is_email_verified              | BOOLEAN            | No       | false                    | Email verification status       |
| email_verification_token       | VARCHAR(255)       | Yes      | -                        | Token for email verification   |
| email_verification_token_expires_at | TIMESTAMP WITH TIME ZONE | Yes | -                        | Expiry datetime for token      |
| is_2fa_enabled                 | BOOLEAN            | No       | false                    | Whether 2FA is enabled          |
| is_email_notifications_enabled | BOOLEAN            | No       | true                     | User's email notification preference |
| language_preference            | VARCHAR(2)         | No       | 'en'                     | User UI language ('en','hi')    |
| theme_preference               | VARCHAR(5)         | No       | 'light'                  | UI theme preference ('light','dark') |
| created_at                    | TIMESTAMP WITH TIME ZONE | No   | CURRENT_TIMESTAMP        | Record creation timestamp       |
| updated_at                    | TIMESTAMP WITH TIME ZONE | No   | CURRENT_TIMESTAMP        | Last update timestamp           |

**Constraints:**

- Primary Key: user_id
- Unique Index: email

**Indexes:**

- email (unique)

---

### 2. password_reset_tokens (existing)

| Column         | Type               | Nullable | Description                   |
|----------------|--------------------|----------|-------------------------------|
| id             | UUID               | No       | Primary key (UUIDV4 generated)|
| user_id        | UUID               | No       | FK → users.user_id (CASCADE)  |
| token          | VARCHAR(255)       | No       | Unique password reset token   |
| expires_at     | TIMESTAMP WITH TIME ZONE | No | Expiration datetime           |
| used_at        | TIMESTAMP WITH TIME ZONE | Yes| When token was used (NULL if unused) |
| created_at     | TIMESTAMP WITH TIME ZONE | No | Creation timestamp            |
| updated_at     | TIMESTAMP WITH TIME ZONE | No | Last update timestamp         |

**Constraints:**

- Primary Key: id
- Unique Index: token

**Indexes:**

- user_id
- token (unique)

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 3. user_otps (existing)

| Column      | Type               | Nullable | Default           | Description                        |
|-------------|--------------------|----------|-------------------|----------------------------------|
| id          | UUID               | No       | UUIDV4            | Primary key                      |
| user_id     | UUID               | No       | -                 | FK → users.user_id (CASCADE)    |
| otp         | VARCHAR(6)         | No       | -                 | One-time Password code           |
| type        | VARCHAR(50)        | No       | 'login_2fa'       | OTP purpose/type                 |
| expires_at  | TIMESTAMP WITH TIME ZONE | No  | -                 | OTP expiration datetime          |
| used_at     | TIMESTAMP WITH TIME ZONE | Yes | NULL              | When OTP was used                |
| created_at  | TIMESTAMP WITH TIME ZONE | No  | CURRENT_TIMESTAMP | Creation timestamp               |
| updated_at  | TIMESTAMP WITH TIME ZONE | No  | CURRENT_TIMESTAMP | Last update timestamp            |

**Constraints:**

- Primary Key: id

**Indexes:**

- Composite Index: (user_id, type)

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 4. user_educations

| Column        | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|---------------------------------|
| id            | UUID                       | No       | Primary key                     |
| user_id       | UUID                       | No       | FK → users.user_id (CASCADE)   |
| institution   | VARCHAR(255)               | No       | Institution name                |
| degree        | VARCHAR(255)               | Yes      | Degree or certificate           |
| field_of_study| VARCHAR(255)               | Yes      | Subject or major                |
| start_date    | DATE                       | Yes      | Start date                     |
| end_date      | DATE                       | Yes      | End date                       |
| description   | TEXT                       | Yes      | Additional details              |
| created_at    | TIMESTAMP WITH TIME ZONE   | No       | Creation timestamp             |
| updated_at    | TIMESTAMP WITH TIME ZONE   | No       | Last update timestamp          |

**Constraints:**

- Primary Key: id

**Indexes:**

- user_id

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 5. user_work_experiences

| Column        | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|---------------------------------|
| id            | UUID                       | No       | Primary key                     |
| user_id       | UUID                       | No       | FK → users.user_id (CASCADE)   |
| company       | VARCHAR(255)               | No       | Employer company name           |
| role          | VARCHAR(255)               | No       | Job title or role               |
| start_date    | DATE                       | Yes      | Employment start date           |
| end_date      | DATE                       | Yes      | Employment end date             |
| description   | TEXT                       | Yes      | Job responsibilities/details   |
| created_at    | TIMESTAMP WITH TIME ZONE   | No       | Creation timestamp             |
| updated_at    | TIMESTAMP WITH TIME ZONE   | No       | Last update timestamp          |

**Constraints:**

- Primary Key: id

**Indexes:**

- user_id

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 6. user_skills

| Column          | Type                     | Nullable | Description                      |
|-----------------|--------------------------|----------|--------------------------------|
| id              | UUID                     | No       | Primary key                    |
| user_id         | UUID                     | No       | FK → users.user_id (CASCADE)  |
| skill_name      | VARCHAR(255)             | No       | Name of skill                 |
| proficiency_level | VARCHAR(50)              | Yes      | Optional proficiency (e.g. Beginner, Intermediate, Expert) |
| created_at      | TIMESTAMP WITH TIME ZONE | No       | Creation timestamp            |
| updated_at      | TIMESTAMP WITH TIME ZONE | No       | Last update timestamp         |

**Constraints:**

- Primary Key: id

**Indexes:**

- user_id

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 7. user_projects

| Column        | Type                       | Nullable | Description                      |
|---------------|----------------------------|----------|--------------------------------|
| id            | UUID                       | No       | Primary key                    |
| user_id       | UUID                       | No       | FK → users.user_id (CASCADE)  |
| project_name  | VARCHAR(255)               | No       | Name of project                |
| description   | TEXT                       | Yes      | Description of project         |
| start_date    | DATE                       | Yes      | Start date                    |
| end_date      | DATE                       | Yes      | End date                      |
| tech_stack    | TEXT                       | Yes      | Technologies used             |
| created_at    | TIMESTAMP WITH TIME ZONE   | No       | Creation timestamp            |
| updated_at    | TIMESTAMP WITH TIME ZONE   | No       | Last update timestamp         |

**Constraints:**

- Primary Key: id

**Indexes:**

- user_id

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 8. job_advertisements

| Column        | Type                       | Nullable | Description                                  |
|---------------|----------------------------|----------|----------------------------------------------|
| id            | UUID                       | No       | Primary key                                 |
| user_id       | UUID                       | No       | FK → users.user_id (CASCADE)                 |
| title         | VARCHAR(255)               | No       | Job title                                   |
| description   | TEXT                       | No       | Job description                             |
| requirements  | TEXT                       | No       | Job requirements                            |
| location      | VARCHAR(255)               | Yes      | Job location (optional)                      |
| language      | VARCHAR(2)                 | No       | Enum: 'en','hi' - language of job ad        |
| created_at    | TIMESTAMP WITH TIME ZONE   | No       | Created timestamp                           |
| updated_at    | TIMESTAMP WITH TIME ZONE   | No       | Last update timestamp                        |

**Constraints:**

- Primary Key: id

**Indexes:**

- user_id

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE

---

### 9. ats_scores

(This table stores cached ATS scores and recommendations for user-jobAd pairs.)

| Column           | Type                       | Nullable | Description                                  |
|------------------|----------------------------|----------|----------------------------------------------|
| id               | UUID                       | No       | Primary key                                 |
| user_id          | UUID                       | No       | FK → users.user_id                          |
| job_ad_id        | UUID                       | No       | FK → job_advertisements.id                   |
| ats_score        | NUMERIC(5,2)               | No       | ATS compatibility score (0.00 - 100.00)     |
| recommendations  | JSONB                      | Yes      | JSON array/object with suggestions           |
| created_at       | TIMESTAMP WITH TIME ZONE   | No       | Score calculation timestamp                  |
| updated_at       | TIMESTAMP WITH TIME ZONE   | No       | Last update timestamp                         |

**Constraints:**

- Primary Key: id
- Unique Index: (user_id, job_ad_id)

**Indexes:**

- user_id
- job_ad_id
- Unique (user_id, job_ad_id)

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE
- job_ad_id REFERENCES job_advertisements(id) ON DELETE CASCADE

---

### 10. resume_templates

| Column        | Type                       | Nullable | Description                                        |
|---------------|----------------------------|----------|--------------------------------------------------|
| id            | UUID                       | No       | Primary key                                     |
| name          | VARCHAR(255)               | No       | Template name                                   |
| language      | VARCHAR(2)                 | No       | 'en' or 'hi' for template language              |
| is_active     | BOOLEAN                    | No       | Whether template is active                       |
| created_at    | TIMESTAMP WITH TIME ZONE   | No       | Creation timestamp                              |
| updated_at    | TIMESTAMP WITH TIME ZONE   | No       | Last update timestamp                           |

**Constraints:**

- Primary Key: id

**Indexes:**

- language
- is_active

---

### 11. generated_resumes (optional)

(Stores metadata about generated resumes for auditing and preview)

| Column        | Type                       | Nullable | Description                                  |
|---------------|----------------------------|----------|----------------------------------------------|
| id            | UUID                       | No       | Primary key                                 |
| user_id       | UUID                       | No       | FK → users.user_id                          |
| job_ad_id     | UUID                       | No       | FK → job_advertisements.id                   |
| resume_template_id | UUID                   | No       | FK → resume_templates.id                      |
| ats_score     | NUMERIC(5,2)               | No       | ATS score at generation time                  |
| file_path     | VARCHAR(512)               | No       | File system path or URL for generated PDF    |
| generated_at  | TIMESTAMP WITH TIME ZONE   | No       | Resume generation timestamp                   |

**Constraints:**

- Primary Key: id

**Indexes:**

- user_id
- job_ad_id
- resume_template_id

**Foreign Keys:**

- user_id REFERENCES users(user_id) ON DELETE CASCADE
- job_ad_id REFERENCES job_advertisements(id) ON DELETE CASCADE
- resume_template_id REFERENCES resume_templates(id) ON DELETE RESTRICT

---

## Relationships

| From Table            | To Table               | Type           | Description                          |
|-----------------------|------------------------|----------------|------------------------------------|
| password_reset_tokens  | users                  | Many-to-One    | User may have many reset tokens    |
| user_otps             | users                  | Many-to-One    | User may have many OTPs             |
| user_educations       | users                  | Many-to-One    | User many educations                |
| user_work_experiences | users                  | Many-to-One    | User many work experience entries  |
| user_skills           | users                  | Many-to-One    | User many skills                   |
| user_projects         | users                  | Many-to-One    | User many projects                 |
| job_advertisements    | users                  | Many-to-One    | Jobs belong to user (job seeker)   |
| ats_scores            | users                  | Many-to-One    | ATS score linked with user          |
| ats_scores            | job_advertisements      | Many-to-One    | ATS score linked with job ad        |
| generated_resumes     | users                  | Many-to-One    | Generated resumes linked to user   |
| generated_resumes     | job_advertisements      | Many-to-One    | Generated resumes linked to job    |
| generated_resumes     | resume_templates        | Many-to-One    | Which template was used             |

---

## Indexes Summary

| Table                | Columns                      | Type        | Notes                                    |
|----------------------|------------------------------|-------------|------------------------------------------|
| users                | email                        | Unique      | Unique index for login                   |
| password_reset_tokens | token                        | Unique      | Password reset token unique index        |
| password_reset_tokens | user_id                      | Index       | FK lookup                               |
| user_otps            | (user_id, type)              | Composite   | For OTP validity and uniqueness          |
| user_educations      | user_id                      | Index       | For user profile retrieval                |
| user_work_experiences| user_id                      | Index       | For user profile retrieval                |
| user_skills          | user_id                      | Index       | For user profile retrieval                |
| user_projects        | user_id                      | Index       | For user profile retrieval                |
| job_advertisements   | user_id                      | Index       | To filter user's job ads                  |
| ats_scores           | (user_id, job_ad_id)         | Unique      | For quick lookup of ATS scores            |
| ats_scores           | user_id                      | Index       |                                          |
| ats_scores           | job_ad_id                    | Index       |                                          |
| resume_templates     | language                     | Index       | Filter templates by language              |
| resume_templates     | is_active                    | Index       | Active templates filter                    |
| generated_resumes    | user_id                      | Index       |                                          |
| generated_resumes    | job_ad_id                    | Index       |                                          |
| generated_resumes    | resume_template_id           | Index       |                                          |

---

## Constraints Summary

- All foreign keys use `ON DELETE CASCADE` where appropriate to maintain referential integrity.
- Unique constraints on:
  - `users.email`
  - `password_reset_tokens.token`
  - `ats_scores (user_id, job_ad_id)`
- Enum constraints:
  - `users.language_preference`: restricted to 'en', 'hi'
  - `users.theme_preference`: restricted to 'light', 'dark'
  - `job_advertisements.language`: 'en', 'hi'
  - `resume_templates.language`: 'en', 'hi'

---

## Data Types Notes

- UUID primary keys generated using PostgreSQL `gen_random_uuid()` or `uuid_generate_v4()`
- Timestamp columns use `TIMESTAMP WITH TIME ZONE` for universal time.
- Proficiency level and other enumerated text fields use VARCHAR with restricted input via application logic or DB CHECK constraints optionally.
- Recommendations stored as JSONB for flexible structured feedback data.

---

# Summary

This design supports:

- Secure user accounts with 2FA and email verification.
- Complete user profile with education, work experience, skills, and projects.
- Storage and management of user-input job advertisements with structured fields.
- ATS scoring caching per user and job ad with recommendations.
- Multiple resume templates available in English and Hindi.
- Generated resumes metadata with file paths and ATS scores.
- User preferences for language and UI theme.
- Referential integrity, indexing, and constraints for performance and data integrity.
```