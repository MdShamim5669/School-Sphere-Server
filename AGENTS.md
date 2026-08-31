# School Sphere Backend — Agent Guidelines & Architecture Rules

## 1. Project Overview & Identity
- **Project**: School Sphere Backend
- **Type**: RESTful API for School Management Platform
- **Stack**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL (`@prisma/client`, `@prisma/adapter-pg`, `pg`), Cloudinary, Multer, Zod, bcryptjs, jsonwebtoken, http-status

---

## 2. Architectural Blueprint & Code Structure

Every feature module inside `src/modules/<ModuleName>/` must strictly adhere to the standard modular architecture:

```text
src/
├── config/
│   └── index.ts                 # Environment variables & runtime configurations
├── lib/
│   ├── prisma.ts                # Singleton Prisma client instance with PostgreSQL adapter
│   └── cloudinary.ts            # Cloudinary SDK configuration
├── errors/
│   ├── AppError.ts              # Custom Application Error extending Error
│   ├── handlePrismaError.ts     # Known Prisma Client request errors handler
│   ├── handlePrismaValidationError.ts # Prisma validation error handler
│   └── handleZodError.ts        # Zod validation error parser
├── interface/
│   └── error.ts                 # Error type definitions & generic response types
├── middlewares/
│   ├── auth.ts                  # JWT verification & role-based access guard
│   ├── upload.ts                # Multer configuration (memoryStorage, mime-filter, size-limit)
│   ├── globalErrorhandler.ts    # Centralized global error handling middleware
│   ├── notFound.ts              # 404 Route not found middleware
│   └── validateRequest.ts       # Express middleware for Zod schema validation
├── modules/
│   ├── Auth/                    # Authentication (Register, Login, Refresh Token)
│   ├── Admin/                   # Platform administrator management
│   ├── Teacher/                 # Teacher profiles, subject assignments
│   ├── Parent/                  # Parent profiles & linked students
│   ├── Student/                 # Student records, enrollment & grades
│   ├── Grade/                   # Grade level management
│   ├── Class/                   # Class sections, supervisors, capacity
│   ├── Subject/                 # Academic subjects & teacher assignments
│   ├── Lesson/                  # Lesson scheduling with conflict detection
│   ├── Exam/                    # Exams per lesson
│   ├── Assignment/              # Take-home tasks per lesson
│   ├── Result/                  # Assessment scores (Exam XOR Assignment)
│   ├── Attendance/              # Daily lesson attendance tracking
│   ├── Event/                   # School-wide and class-specific events
│   └── Announcement/            # School-wide and class-specific announcements
├── routes/
│   └── index.ts                 # Central Application Route Aggregator
├── utils/
│   ├── catchAsync.ts            # Async wrapper eliminating try-catch in controllers
│   └── sendResponse.ts          # Unified JSON response helper
├── app.ts                       # Express application bootstrap & middleware pipeline
└── server.ts                    # HTTP server entry point & graceful shutdown
```

---

## 3. Standard Module Pattern

Every module folder must follow this exact convention:
- `<module>.interface.ts`: TypeScript types and interfaces for the domain model and query parameters.
- `<module>.validation.ts`: Zod validation schemas for request bodies, query params, and route params.
- `<module>.controller.ts`: Request parsing, calling service layer, formatting with `sendResponse` wrapped in `catchAsync`.
- `<module>.service.ts`: Core business logic, Prisma ORM queries, transactional consistency, and business rule enforcement.
- `<module>.route.ts`: Express router defining endpoints with `auth(...)`, `validateRequest(...)`, and controller bindings.
- `<module>.constant.ts`: Searchable fields, filterable fields, pagination defaults, and enum mappings.

---

## 4. Key Business Logic & Non-Negotiable Rules

1. **User Registration & Passwords**:
   - Accounts (`Teacher`, `Parent`, `Student`) are created by Admin.
   - Passwords must be hashed using `bcryptjs` with `BCRYPT_SALT_ROUND=12`.
2. **Authentication & Token Management**:
   - JWT Auth: Access token (short-lived, e.g., 1d) and Refresh token (long-lived, e.g., 7d).
   - Refresh token sent and stored via `httpOnly` secure cookies.
   - Auth middleware must verify JWT, check user existence in DB, and validate role permissions.
3. **Lesson Scheduling Conflict Detection**:
   - Admin schedules lessons for Subject, Class, and Teacher on Mon–Fri with `startTime` and `endTime`.
   - **MUST CHECK**: No overlapping lesson time slots for the **same teacher** OR the **same class** before inserting or updating.
4. **Assessment Results XOR Constraint**:
   - Every `Result` must reference **either** `examId` **or** `assignmentId`, never both, never neither.
5. **Attendance Constraint**:
   - Only assigned teachers (or Admins) can mark attendance for their lessons.
   - Only one attendance record per student per lesson per date (enforced with DB unique composite constraint).
6. **Class Capacity & Grade Matching**:
   - Enrolling a student into a class must verify that current enrolled count does not exceed `class.capacity`.
   - Student's `gradeId` must match the `gradeId` of the enrolled `Class`.
7. **Scoped Visibility**:
   - `Parent`: Can only view data/records for their own linked students.
   - `Student`: Can only query their own personal records, attendance, and results.
   - `Teacher`: Scoped to their own assigned lessons, classes, and subjects.
   - `Admin`: Unrestricted full management access.
8. **Cloudinary Image Lifecycle**:
   - Multer handles multipart file uploads in memory (`memoryStorage`), enforcing image-only MIME types and 2MB limit.
   - When replacing a profile image, the previous Cloudinary asset must be deleted using the Cloudinary Admin API, avoiding orphaned assets.
9. **Cascades & Deletion Integrity**:
   - Deleting a Parent, Teacher, Class, Grade, or Subject with dependent records must be blocked or explicitly handled with safe cascades as defined in the PRD.

---

## 5. API Response Contracts

### Success Response Format:
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "data": { ... }
}
```

### Error Response Format:
```json
{
  "success": false,
  "message": "Error message description",
  "errorSources": [
    {
      "path": "field_name",
      "message": "Specific validation or business error"
    }
  ],
  "stack": "..." // Included only when NODE_ENV === 'development'
}
```
