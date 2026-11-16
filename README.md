# Work Attendance Management System

A full-stack MERN application for managing employee attendance, check-ins, and leave requests.

## Project Structure

```
├── client/          # React.js frontend (Bootstrap 5)
│   ├── public/
│   └── src/
│       ├── components/   # Reusable components
│       ├── context/      # Auth context
│       ├── pages/        # Page components
│       └── services/     # Axios API service
│
└── server/          # Node.js / Express backend
    └── src/
        ├── controllers/
        ├── middleware/
        ├── models/
        └── routes/
```

## Quick Start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # Edit MONGO_URI and JWT_SECRET
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm start
```

App runs at http://localhost:3000, API at http://localhost:5000.

## Features

- JWT authentication with role-based access (Admin / Manager / AttendanceManager / Employee)
- Attendance Manager records check-in / check-out on behalf of employees (no employee login needed)
- Each attendance record tracks the user who recorded it
- Check-in / Check-out with late detection (past 9:00 AM = Late)
- Half-day detection (< 4 hours = Half-Day on checkout)
- Total working hours calculation
- Leave management with approval workflow
- Admin dashboard with date/department filters
- Real-time clock on employee dashboard
- Paginated attendance records

## API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /api/auth/register | — | — |
| POST | /api/auth/login | — | — |
| GET | /api/auth/me | ✓ | Any |
| POST | /api/attendance/check-in | ✓ | Any |
| POST | /api/attendance/check-out | ✓ | Any |
| POST | /api/attendance/record/check-in | ✓ | AttendanceManager / Admin |
| POST | /api/attendance/record/check-out | ✓ | AttendanceManager / Admin |
| GET | /api/attendance/my-history | ✓ | Any |
| GET | /api/attendance/today | ✓ | Any |
| GET | /api/attendance/admin/all | ✓ | Admin / Manager / AttendanceManager |
| GET | /api/attendance/admin/summary | ✓ | Admin / Manager / AttendanceManager |
| POST | /api/leaves | ✓ | Any |
| GET | /api/leaves/my | ✓ | Any |
| GET | /api/leaves/admin/all | ✓ | Admin/Manager |
| PATCH | /api/leaves/:id/review | ✓ | Admin/Manager |
| GET | /api/users | ✓ | Admin / Manager / AttendanceManager |
| PATCH | /api/users/:id | ✓ | Admin |
