## 🏥 MediKnight — Healthcare Portal
A full-stack, role-based healthcare portal with secure invite-only access, MFA authentication, and comprehensive patient data management.
Live Demo: https://medi-knight.vercel.app/

## 🚀 Quick Start (Demo)
Click any role on the login page for instant access — no OTP or email verification required for demo accounts.

| Role	| Email |	Password |
| --- | --- | --- |
|👤 Admin	| `admin@example.com` |	`Demo@1234` |
| 🩺 Doctor	| `doctor@example.com` |	`Demo@1234` |
|💉 Nurse	| `nurse@example.com`	| `Demo@1234` |
|🧑‍⚕️ Patient	| `patient@example.com` |	`Demo@1234` |

## 🛠 Tech Stack
Layer	Technology
Frontend	Next.js 16, React 19, Tailwind CSS, shadcn/ui
Backend	FastAPI (Python 3.12), Uvicorn
Auth	Supabase Auth (Email + OTP MFA)
Database	MongoDB Atlas (via Beanie ODM + Motor)
Deployment	Koyeb (backend), Vercel (frontend)

🏗 Architecture
System Overview

```mermaid
graph TD
       Client["<b>CLIENT (Browser)</b><br/>Next.js 16 · React 19 · Tailwind CSS<br/>/auth/login → /auth/mfa →
  /dashboard/{role}"]

       Backend["<b>BACKEND
  (FastAPI)</b><br/>/api/v1/auth/*&nbsp;&nbsp;/api/v1/patients/*&nbsp;&nbsp;/api/v1/admin/*<br/>Role Guards →
  get_current_user → require_roles([...])"]

       Supabase["<b>Supabase Auth</b><br/>- Email signin<br/>- OTP via email<br/>- JWT tokens<br/>- Token verify"]

       Mongo["<b>MongoDB Atlas</b><br/>Collections:<br/>· users<br/>· invites<br/>· patient_records<br/>·
  prescriptions<br/>· appointments<br/>· audit_logs"]

       Client -->|"HTTPS (JWT Bearer Token)"| Backend
       Backend --> Supabase
       Backend --> Mongo
```

---

🔐 Security & Auth Flow
Regular User Login (2-Factor)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant SB as Supabase Auth
    participant DB as MongoDB

    U->>FE: Enter email + password
    FE->>BE: POST /auth/login
    BE->>DB: Check email in users collection
    DB-->>BE: User found + is_active=true
    BE->>SB: sign_in_with_password()
    SB-->>BE: Password verified ✓
    BE->>SB: sign_in_with_otp() → email sent
    BE-->>FE: { mfa_required: true, email }
    FE->>U: Redirect → /auth/mfa

    U->>FE: Enter 6-digit OTP from email
    FE->>BE: POST /auth/mfa/verify
    BE->>SB: verify_otp(email, token)
    SB-->>BE: Session { access_token, refresh_token }
    BE->>DB: Fetch full user profile
    BE-->>FE: { access_token, refresh_token, user }
    FE->>U: Redirect → /dashboard/{role}
```

Demo User Login (No OTP)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant SB as Supabase Auth

    U->>FE: Click demo role button
    FE->>BE: POST /auth/login (is_demo=true user)
    BE->>SB: sign_in_with_password()
    SB-->>BE: Session tokens returned
    BE-->>FE: { mfa_required: false, access_token, user }
    FE->>U: Redirect → /dashboard/{role} immediately
```

Every Authenticated Request

```
Request → Bearer Token → Supabase.get_user(token)
        → MongoDB: users.find(auth_id)
        → Check is_active
        → Check role matches route guard
        → Handler executes
```

---

🎭 Role-Based Access Control
Invite / Signup System
No one can sign up without first being whitelisted. All accounts require an invitation.

```
Admin ──can invite──► Admin, Doctor, Nurse, Patient
Doctor ──can invite──► Patient only
Nurse ────────────────► cannot invite anyone
Patient ──────────────► cannot invite anyone
```

Data Access Matrix

| Resource | Admin | Doctor | Nurse | Patient |
   |---|---|---|---|---|
   | All users list | ✅ | ❌ | ❌ | ❌ |
   | Audit logs | ✅ | ❌ | ❌ | ❌ |
   | Invite whitelist (all) | ✅ | ❌ | ❌ | ❌ |
   | Invite whitelist (own) | ✅ | ✅ | ❌ | ❌ |
   | Patient list | ✅ | ✅ | ✅ | ❌ |
   | Any patient's records | ✅ | ✅ | ✅ | ❌ |
   | Own records only | — | — | — | ✅ |
   | Create records (vitals/notes) | ❌ | ✅ | ✅ | ❌ |
   | Create records (diagnosis/lab) | ❌ | ✅ | ❌ | ❌ |
   | Create prescriptions | ❌ | ✅ | ❌ | ❌ |
   | View prescriptions | ✅ | ✅ | ✅ | ✅ own |
   | Create appointments | ❌ | ✅ | ❌ | ❌ |
   | View appointments | ✅ | ✅ | ✅ | ✅ own |
   | Disable user accounts | ✅ | ❌ | ❌ | ❌ |

Backend Route Guards

```python
require_admin          = [admin]
require_doctor         = [doctor]
require_nurse          = [nurse]
require_patient        = [patient]
require_medical_staff  = [doctor, nurse]
require_clinical       = [doctor, nurse, admin]
get_current_user       = any authenticated user
```

---

## 📋 Role Capabilities
👤 Admin
View system-wide dashboard (user counts, audit stats)
Manage all users (view, deactivate accounts)
View full audit logs
Whitelist any email with any role (admin/doctor/nurse/patient)
🩺 Doctor
Full patient list with search
Create & manage patient records (diagnosis, lab, imaging, vitals, notes)
Create, update, delete prescriptions
Schedule & manage appointments
Whitelist patient emails only
💉 Nurse
View all patients
Add vitals and notes to patient records
View (read-only) prescriptions and appointments
Cannot create prescriptions or appointments
🧑‍⚕️ Patient
View own medical records
View own prescriptions
View & track own appointments
Update own profile (name, date of birth)

📁 Project Structure

```
mediknight/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   └── app/
│       ├── api/v1/endpoints/      # Route handlers
│       │   ├── auth.py            # Login, MFA, signup, seed-demo
│       │   ├── patients.py        # Records, prescriptions, appointments
│       │   ├── invites.py         # Whitelist management
│       │   ├── admin.py           # Admin stats & user management
│       │   └── audit_logs.py      # Audit trail
│       ├── models/                # Beanie (MongoDB) documents
│       │   ├── users.py
│       │   ├── patient_record.py
│       │   ├── prescription.py
│       │   ├── appointment.py
│       │   ├── invite.py
│       │   └── audit_log.py
│       ├── schemas/               # Pydantic request/response schemas
│       ├── services/
│       │   └── auth.py            # Auth logic, demo user seeding
│       ├── dependancies/
│       │   └── auth.py            # JWT + role guards
│       ├── core/
│       │   └── config.py          # Settings from .env
│       └── db/
│           └── session.py         # MongoDB + Beanie init
│
└── frontend/
    ├── app/
    │   ├── page.tsx               # Landing page
    │   ├── auth/                  # Login, signup, MFA pages
    │   └── dashboard/
    │       ├── admin/             # Admin dashboard + users + audit logs
    │       ├── doctor/            # Doctor dashboard + patients + records + prescriptions + appointments
    │       ├── nurse/             # Nurse dashboard + patients
    │       └── patient/           # Patient dashboard + records + prescriptions + appointments
    ├── components/
    │   ├── auth/                  # LoginForm, SignupForm, MFAForm
    │   ├── layout/                # Sidebar, Header
    │   └── ui/                    # shadcn components
    └── lib/
        ├── api.ts                 # All API calls (central client)
        ├── auth-context.tsx       # Auth state + login/logout
        ├── types.ts               # TypeScript types
        └── constants.ts           # Role labels, permissions
```

---

⚙️ Environment Variables
Backend (`backend/.env`)

```
# Database
DATABASE_URI=mongodb+srv://user:pass@cluster.mongodb.net/

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Security
SECRET_KEY=your-secret-key
BOOTSTRAP_SECRET=your-bootstrap-secret   # enables /auth/bootstrap-admin + /auth/seed-demo

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app
```

Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=https://your-backend.koyeb.app
```

---

🌱 Seeding Demo Users
After first deployment, run once to create demo accounts:

```bash
curl -X POST <https://your-backend.koyeb.app/api/v1/auth/seed-demo> \\
  -H "Content-Type: application/json" \\
  -d '{"secret": "your-bootstrap-secret"}'
```

Response:

```json
{
  "message": "Demo users seeded.",
  "results": [
    {"email": "admin@example.com",   "role": "admin",   "status": "created"},
    {"email": "doctor@example.com",  "role": "doctor",  "status": "created"},
    {"email": "nurse@example.com",   "role": "nurse",   "status": "created"},
    {"email": "patient@example.com", "role": "patient", "status": "created"}
  ]
}
```

---

🏃 Running Locally
Backend

```bash
cd backend
uv sync                          # install dependencies
cp .env.example .env             # fill in your secrets
uv run uvicorn main:app --reload
# API runs at <http://localhost:8000>
# Docs at   <http://localhost:8000/docs>
```

Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# App runs at <http://localhost:3000>
```

---

📜 API Reference
| Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | POST | `/api/v1/auth/signup` | — | Register (requires invite) |
   | POST | `/api/v1/auth/login` | — | Password check → OTP or direct (demo) |
   | POST | `/api/v1/auth/mfa/verify` | — | Verify OTP → issue tokens |
   | POST | `/api/v1/auth/seed-demo` | Bootstrap secret | Create 4 demo users |
   | POST | `/api/v1/auth/bootstrap-admin` | Bootstrap secret | Create first admin |
   | GET | `/api/v1/admin/stats` | Admin | Dashboard stats |
   | GET | `/api/v1/admin/users` | Admin | All users |
   | GET/POST | `/api/v1/invites` | Admin/Doctor | Manage whitelist |
   | GET | `/api/v1/patients` | Clinical | Patient list |
   | GET/POST | `/api/v1/patients/{id}/records` | Clinical | Medical records |
   | GET/POST | `/api/v1/patients/{id}/prescriptions` | Clinical | Prescriptions |
   | GET/POST | `/api/v1/patients/{id}/appointments` | Doctor | Appointments |
   | PATCH | `/api/v1/patients/me/profile` | Patient | Update own profile |
   | GET | `/api/v1/audit-logs` | Admin | Audit trail |
