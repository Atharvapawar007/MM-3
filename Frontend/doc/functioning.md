# BusTrack App – Functionality and Architecture

## Overview
- The BusTrack Admin Portal consists of:
  - Frontend: React + TypeScript app in `Frontend/`
  - Backend: Node.js/Express + MongoDB API in `Backend/`
- Purpose: Manage drivers, buses, and students; support authentication and password reset; send credentials/invitations via email.

## Tech Stack
- Frontend: React, TypeScript, Vite, lucide-react, sonner (toasts)
- Backend: Node.js, Express, Mongoose (MongoDB), JWT, bcrypt
- Auth: Token-based (JWT), token stored in localStorage

## Frontend Architecture
- Entry: [Frontend/src/App.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/App.tsx:0:0-0:0)
  - Manages navigation across pages (login, allocation, driver list, student management, forgot/new password)
  - Loads drivers/students after login or page change
  - Persists and reads `token` (and `userId`) from localStorage

- Pages/Components:
  - [src/components/LoginPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/LoginPage.tsx:0:0-0:0)
    - POST `/api/auth/login` with email/password
    - On success: store token/userId; navigate to allocation
  - [src/components/DriverAllocationPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/DriverAllocationPage.tsx:0:0-0:0)
    - Form to add driver + assign bus
    - Uploads base64 photos (driver photo, bus photo)
    - POST `/api/drivers/add`
    - Navigation buttons to Drivers/Students
  - [src/components/DriverListPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/DriverListPage.tsx:0:0-0:0)
    - View, edit, delete drivers
    - Uses API for GET `/api/drivers/list`, PUT `/api/drivers/update/:id`, DELETE `/api/drivers/delete/:id`
  - [src/components/StudentManagementPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/StudentManagementPage.tsx:0:0-0:0)
    - Fetch buses and students
    - Search by name or PRN
    - Add, edit, delete students
    - Send invitations, bulk credentials
    - Uses GET `/api/buses/list`, GET `/api/students/list?busId=`, POST/PUT/DELETE
  - Forgot/New Password pages (as routed by [App.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/App.tsx:0:0-0:0))
    - Interact with `/api/auth/forgot-password` and `/api/auth/reset-password`

- Types:
  - [src/types/index.ts](cci:7://file:///f:/BusTrack%20App/Frontend/src/types/index.ts:0:0-0:0) defines [Bus](cci:2://file:///f:/BusTrack%20App/Frontend/src/types/index.ts:0:0-11:1), [Driver](cci:2://file:///f:/BusTrack%20App/Frontend/src/types/index.ts:13:0-26:1), [Student](cci:2://file:///f:/BusTrack%20App/Frontend/src/App.tsx:23:0-34:1), [ApiResponse](cci:2://file:///f:/BusTrack%20App/Frontend/src/types/index.ts:44:0-49:1)
  - Note: Students use PRN as `id` (maps to Mongo `_id`)

- API Service:
  - [src/services/api.ts](cci:7://file:///f:/BusTrack%20App/Frontend/src/services/api.ts:0:0-0:0) wraps fetch with Authorization header (from localStorage token)
  - [src/config/api.ts](cci:7://file:///f:/BusTrack%20App/Frontend/src/config/api.ts:0:0-0:0) provides similar endpoints and maps Mongo `_id` to `id` for UI

## Backend Architecture
- Entry: [Backend/src/index.js](cci:7://file:///f:/BusTrack%20App/Backend/src/index.js:0:0-0:0)
  - Express app
  - CORS configured for frontend origin
  - Routes mounted under `/api`: `/auth`, `/drivers`, `/students`, `/buses`
  - Connects to MongoDB using `MONGO_URI`

- Routes:
  - [Backend/src/routes/authRoutes.js](cci:7://file:///f:/BusTrack%20App/Backend/src/routes/authRoutes.js:0:0-0:0)
  - [Backend/src/routes/driverRoutes.js](cci:7://file:///f:/BusTrack%20App/Backend/src/routes/driverRoutes.js:0:0-0:0) (protected by JWT middleware)
  - [Backend/src/routes/studentRoutes.js](cci:7://file:///f:/BusTrack%20App/Backend/src/routes/studentRoutes.js:0:0-0:0) (protected)
  - [Backend/src/routes/busRoutes.js](cci:7://file:///f:/BusTrack%20App/Backend/src/routes/busRoutes.js:0:0-0:0) (protected)

- Models:
  - [Backend/src/models/User.js](cci:7://file:///f:/BusTrack%20App/Backend/src/models/User.js:0:0-0:0)
    - email, hashed password, role (admin/sub-admin)
    - resetPasswordToken + resetPasswordExpires
  - [Backend/src/models/Driver.js](cci:7://file:///f:/BusTrack%20App/Backend/src/models/Driver.js:0:0-0:0)
    - name, number, gender, contact, email, photo, busPlate, busNumber, busPhoto, userId
    - Uniqueness: number, email, busPlate, busNumber
  - [Backend/src/models/Student.js](cci:7://file:///f:/BusTrack%20App/Backend/src/models/Student.js:0:0-0:0)
    - `_id` = PRN
    - name, gender, email, busId (ref Driver), username, password
    - flags: credentialsGenerated, invitationSent
    - Indexes on busId and email
    - JSON transform mapping `_id` -> `id`

- Controllers:
  - [Backend/src/controllers/authController.js](cci:7://file:///f:/BusTrack%20App/Backend/src/controllers/authController.js:0:0-0:0)
    - register, login, forgotPassword, resetPassword
    - Issues JWT, hashes passwords, sends emails
  - [Backend/src/controllers/driverController.js](cci:7://file:///f:/BusTrack%20App/Backend/src/controllers/driverController.js:0:0-0:0)
    - addDriver, getDrivers, getDriverById, updateDriver, deleteDriver
    - Deleting a driver also handles associated students
  - [Backend/src/controllers/studentController.js](cci:7://file:///f:/BusTrack%20App/Backend/src/controllers/studentController.js:0:0-0:0)
    - addStudent, updateStudent (handles PRN change), deleteStudent, getStudents
    - sendStudentCredentials, sendBulkCredentials, sendInvitations, cleanupIndexes
  - Middleware: JWT verification for protected routes

## API Endpoints (Summary)
- Auth:
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - POST `/api/auth/forgot-password`
  - POST `/api/auth/reset-password`
- Drivers:
  - POST `/api/drivers/add`
  - GET `/api/drivers/list`
  - GET `/api/drivers/:id`
  - PUT `/api/drivers/update/:id`
  - DELETE `/api/drivers/delete/:id`
- Students:
  - POST `/api/students/add`
  - PUT `/api/students/update/:id`
  - DELETE `/api/students/delete/:id`
  - GET `/api/students/list?busId=<driverId>`
  - POST `/api/students/send-credentials/:id`
  - POST `/api/students/send-bulk-credentials`
  - POST `/api/students/send-invitations`
  - POST `/api/students/cleanup-indexes`
- Buses:
  - GET `/api/buses/list`

## Data Model Notes
- Driver uniqueness constraints ensure no duplicates for bus identifiers and contact
- Student uses PRN as primary key (`_id`)
- Frontend expects `id` fields (mapped from Mongo’s `_id`)

## Authentication Flow
- Login ([LoginPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/LoginPage.tsx:0:0-0:0)): stores JWT in localStorage
- Frontend APIs attach Authorization: `Bearer <token>`
- Forgot/Reset password handled via email-based tokens and `reset-password` endpoint

## Key User Flows
- Add Driver:
  - Admin fills form in [DriverAllocationPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/DriverAllocationPage.tsx:0:0-0:0)
  - Photos are base64 strings; POST to `/api/drivers/add`
- Manage Drivers:
  - List/edit/delete in [DriverListPage.tsx](cci:7://file:///f:/BusTrack%20App/Frontend/src/components/DriverListPage.tsx:0:0-0:0)
- Manage Students:
  - Choose bus (driver), list students, search by PRN/name
  - Add/edit/delete students
  - Send invitations / credentials (bulk or single)
- Password Reset:
  - Forgot password form -> email link -> new password page

## Environment Variables
- Backend requires:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `EMAIL_HOST` (and related email config)
  - `RESET_PASSWORD_SECRET`

## Operational Notes
- Token is stored in localStorage and read by [src/services/api.ts](cci:7://file:///f:/BusTrack%20App/Frontend/src/services/api.ts:0:0-0:0)
- Backend logs are verbose for delete/update operations (useful for debugging)
- Frontend uses toast notifications (`sonner`) for feedback
- Base64 image uploads for drivers and buses

## Setup and Run
- See [README.md](cci:7://file:///f:/BusTrack%20App/README.md:0:0-0:0) for steps
- Note: URLs in README currently show https://localhost; typical local dev is http://localhost (verify your setup)

## Future Enhancements
- Improve UI/UX and accessibility
- Strengthen validation on frontend forms
- Enhance logging/metrics and error boundaries
- Consider role-based access controls beyond admin/sub-admin
- Optimize image handling (move from base64 to object storage)