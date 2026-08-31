# School Sphere Backend — API Design & Middleware Standards

All API routes, controllers, and middlewares in School Sphere Backend must follow these exact conventions.

## 1. Route Prefixing & Versioning
- All routes must be prefixed with `/api/v1/`.
- The central aggregator is located at `src/routes/index.ts`.
- Sub-routes must be mounted logically:
  - `/api/v1/auth` -> `AuthRoutes`
  - `/api/v1/teachers` -> `TeacherRoutes`
  - `/api/v1/parents` -> `ParentRoutes`
  - `/api/v1/students` -> `StudentRoutes`
  - `/api/v1/grades` -> `GradeRoutes`
  - `/api/v1/classes` -> `ClassRoutes`
  - `/api/v1/subjects` -> `SubjectRoutes`
  - `/api/v1/lessons` -> `LessonRoutes`
  - `/api/v1/exams` -> `ExamRoutes`
  - `/api/v1/assignments` -> `AssignmentRoutes`
  - `/api/v1/results` -> `ResultRoutes`
  - `/api/v1/attendances` -> `AttendanceRoutes`
  - `/api/v1/events` -> `EventRoutes`
  - `/api/v1/announcements` -> `AnnouncementRoutes`

---

## 2. Authentication & Authorization Middleware
- Middleware signature: `auth(...roles: string[])`
- Steps in `auth` middleware:
  1. Extract Bearer token from `Authorization` header (`req.headers.authorization`).
  2. Verify token using `JWT_ACCESS_SECRET`.
  3. Query database to confirm user still exists and status is active.
  4. If `roles` are passed, verify `roles.includes(decodedUser.role)`. If not permitted, throw `AppError(httpStatus.FORBIDDEN, "You are not authorized to access this route")`.
  5. Attach verified user payload to `req.user`.

---

## 3. Request Validation Middleware
- Every mutating route (POST, PATCH, PUT) and parameterized search/pagination query must be validated using `validateRequest(schema)` where schema is a Zod schema.
- Schema validates `req.body`, `req.query`, and/or `req.params`.

---

## 4. Query Pagination, Sorting & Filtering Standard
List endpoints must accept standardized query parameters:
- `page`: default 1 (positive integer)
- `limit`: default 10 (positive integer)
- `sortBy`: field to sort by (e.g. `createdAt`, `name`)
- `sortOrder`: `asc` | `desc` (default `desc`)
- `searchTerm`: string for searching across searchable fields (e.g., name, username, email)
- Domain filters (e.g. `gradeId`, `classId`, `teacherId`, `day`, `startDate`, `endDate`)

---

## 5. Unified Response Utilities
- **`sendResponse<T>(res, { statusCode, success, message, meta, data })`**:
  Must be used in every controller.
- **`catchAsync(fn)`**:
  Wraps all controller functions to eliminate boiler-plate `try-catch` blocks and forward uncaught exceptions to `next(err)`.

---

## 6. Global Error Handling
The `globalErrorHandler` must catch and format all errors into the standard error format:
- Handle `ZodError` -> format with `handleZodError` returning specific field error paths.
- Handle `PrismaClientKnownRequestError` -> format with `handlePrismaError` (e.g., code `P2002` for unique constraint violation, `P2025` for record not found).
- Handle `PrismaClientValidationError` -> format with `handlePrismaValidationError`.
- Handle custom `AppError`.
- Handle standard `Error`.
