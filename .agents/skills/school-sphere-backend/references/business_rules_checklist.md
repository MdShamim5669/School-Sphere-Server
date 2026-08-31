# School Sphere Business Rules & Validation Checklist

Use this checklist during implementation and code reviews to ensure 100% compliance with School Sphere PRD constraints.

---

## 1. Authentication & Role Permissions
- [ ] User accounts (Admin, Teacher, Parent, Student) are registered with hashed passwords via `bcryptjs` (salt rounds: 12).
- [ ] Login returns access token (short-lived) in payload and refresh token (long-lived) in `httpOnly`, secure cookie.
- [ ] `auth` middleware checks:
  1. Token presence & valid signature.
  2. Database user existence & active status.
  3. Role matches endpoint requirement.
- [ ] Scoped permissions:
  - Teachers can only modify assessments, attendance, events/announcements for their assigned lessons/classes.
  - Parents can only retrieve records of their linked children.
  - Students can only retrieve their own records.

---

## 2. Lesson Conflict Detection
- [ ] When creating a lesson (`POST /api/v1/lessons`) or updating (`PATCH /api/v1/lessons/:id`):
  - Check whether `startTime < endTime`.
  - Query existing lessons on the same `day` where `teacherId = targetTeacherId` OR `classId = targetClassId`.
  - Overlap condition: `startTime < existing.endTime` AND `endTime > existing.startTime`.
  - If conflicting, reject with HTTP 409 Conflict.

---

## 3. Results XOR Integrity
- [ ] When creating a result (`POST /api/v1/results`) or updating (`PATCH /api/v1/results/:id`):
  - Check that exactly one of `examId` or `assignmentId` is provided.
  - Reject if both are provided or neither is provided with HTTP 400 Bad Request.
  - Verify that the lesson corresponding to the exam/assignment belongs to the class where the student is enrolled.

---

## 4. Class Capacity & Student Enrollment
- [ ] When enrolling a student into a class:
  - Check that `student.gradeId === class.gradeId`. If not, reject with HTTP 400 Bad Request.
  - Check that total enrolled students in `class` is strictly less than `class.capacity`.
  - If capacity reached, reject with HTTP 400 Bad Request.

---

## 5. Attendance Uniqueness & Scoping
- [ ] Only the assigned teacher of the lesson or Admin can mark attendance.
- [ ] Student must belong to the lesson's class.
- [ ] Enforce database unique constraint `(studentId, lessonId, date)`.
- [ ] If already marked, updating via `PATCH /api/v1/attendances/:id` updates present status.

---

## 6. Multer & Cloudinary Image Upload Lifecycle
- [ ] Multer middleware accepts only `image/jpeg`, `image/png`, `image/webp`.
- [ ] Maximum file size: 2MB.
- [ ] On profile image replace (`POST /api/v1/teachers/:id/image` or `/api/v1/students/:id/image`):
  - If previous image exists on Cloudinary, invoke `cloudinary.uploader.destroy(publicId)` before or immediately after setting the new image URL.
- [ ] On image deletion (`DELETE` endpoints), delete from Cloudinary and set `img` to null.

---

## 7. Cascade Deletion Safety
- [ ] Prevent accidental deletion of entities that have dependent records unless explicitly cascading:
  - Grade: Cannot delete if classes or students are attached.
  - Class: Cannot delete if lessons or students are attached.
  - Subject: Cannot delete if lessons are attached.
  - Teacher: Cannot delete if assigned to active lessons or supervising classes.
