# School Sphere Backend — Business Logic Rules

These rules must be enforced across all service layers, validation schemas, and database constraints in the School Sphere backend.

## 1. Lesson Conflict Detection Rule
Before creating or updating any `Lesson`, execute a conflict check:
- Query existing lessons where:
  - `day` matches the target day (e.g. `MONDAY`),
  - (`teacherId` == new `teacherId` OR `classId` == new `classId`),
  - For update: `id` != current lesson `id`,
  - Time overlap condition: `startTime < newEndTime` AND `endTime > newStartTime`.
- If any conflicting record exists, throw `AppError(httpStatus.CONFLICT, "Lesson time slot conflicts with an existing lesson for this teacher or class")`.

---

## 2. Assessment Result XOR Rule
When creating or updating a `Result` record:
- Must have exactly ONE of `examId` or `assignmentId`.
- If both are present, or neither is present, throw `AppError(httpStatus.BAD_REQUEST, "A Result must reference either an exam or an assignment, never both and never neither")`.
- Verify that the score entry is tied to a student enrolled in the respective lesson/class.
- Only the teacher assigned to the parent lesson (or Admin) has write permissions.

---

## 3. Class Capacity & Grade Consistency
When creating or updating a `Student`:
- If `classId` is provided:
  - Fetch class details including `gradeId`, `capacity`, and current `_count.students`.
  - Ensure `student.gradeId === class.gradeId`. If not, throw `AppError(httpStatus.BAD_REQUEST, "Student grade must match the grade of the assigned class")`.
  - On new student enrollment or class transfer: Ensure `_count.students < class.capacity`. If exceeded, throw `AppError(httpStatus.BAD_REQUEST, "Class has reached its maximum student capacity")`.

---

## 4. Attendance Marking Integrity
When recording `Attendance`:
- Can only be marked by the teacher assigned to the lesson or an Admin.
- Must validate that the student belongs to the class where the lesson is conducted.
- Enforce the DB unique composite constraint `@@unique([studentId, lessonId, date])`.
- If marking for an already recorded student-lesson-date, handle via update or conflict error.

---

## 5. Scoped Access Control & Data Isolation
- **Admin**: Full read/write access across all system entities.
- **Teacher**:
  - Can only create exams, assignments, and mark attendance for lessons they are assigned to.
  - Can view their own classes, students in those classes, and their own lessons.
- **Parent**:
  - Can only query student profiles, attendance records, exam results, and events/announcements applicable to their linked children (`student.parentId === parent.id`).
- **Student**:
  - Can only access their own profile (`student.id === authenticatedUser.id`), attendance history, scores/results, and their class/school events & announcements.

---

## 6. Image Management Lifecycle (Cloudinary)
- Allowed formats: `image/jpeg`, `image/png`, `image/webp`. Max size: 2MB.
- When an image is updated on a Teacher or Student profile:
  - If a previous image public ID exists, dispatch a deletion request to Cloudinary (`cloudinary.uploader.destroy(publicId)`).
  - Save new secure URL and public ID to the database.
- When an image is deleted (`DELETE /api/v1/teachers/:id/image` or `/api/v1/students/:id/image`), delete from Cloudinary and set `img` field in DB to `null`.
