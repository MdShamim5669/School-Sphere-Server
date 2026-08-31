# School Sphere Data Model & Prisma Schema Reference (Multi-File Structure)

This document provides the complete data model specifications for the 14 core entities in the School Sphere platform.

The Prisma schema is organized into separate files under `prisma/schema/` using Prisma's `prismaSchemaFolder` preview feature.

```text
prisma/
└── schema/
    ├── schema.prisma         # Generator & datasource config
    ├── enums.prisma          # UserRole, UserSex, BloodType, DayOfWeek
    ├── admin.prisma          # Admin model
    ├── teacher.prisma        # Teacher model
    ├── parent.prisma         # Parent model
    ├── student.prisma        # Student model
    ├── grade.prisma          # Grade model
    ├── class.prisma          # Class model
    ├── subject.prisma        # Subject model
    ├── lesson.prisma         # Lesson model
    ├── exam.prisma           # Exam model
    ├── assignment.prisma     # Assignment model
    ├── result.prisma         # Result model
    ├── attendance.prisma     # Attendance model
    ├── event.prisma          # Event model
    └── announcement.prisma   # Announcement model
```

---

## 1. Enums (`prisma/schema/enums.prisma`)

```prisma
enum UserRole {
  ADMIN
  TEACHER
  PARENT
  STUDENT
}

enum UserSex {
  MALE
  FEMALE
}

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}
```

---

## 2. Core Entities & Relationships

### 1. Admin (`prisma/schema/admin.prisma`)
- **Attributes**: `id` (UUID), `username` (unique), `password` (hashed), `createdAt`, `updatedAt`
- **Relationships**: Full administrative authority; no direct entity relationships.

### 2. Teacher (`prisma/schema/teacher.prisma`)
- **Attributes**: `id`, `username` (unique), `password`, `name`, `surname`, `email` (optional, unique), `phone` (optional, unique), `address`, `img` (optional URL), `bloodType` (BloodType), `sex` (UserSex), `birthday` (DateTime), `createdAt`, `updatedAt`
- **Relationships**:
  - `subjects`: Many-to-Many (`Subject[]`)
  - `lessons`: One-to-Many (`Lesson[]`)
  - `supervisedClasses`: One-to-Many (`Class[]`)

### 3. Parent (`prisma/schema/parent.prisma`)
- **Attributes**: `id`, `username` (unique), `password`, `name`, `surname`, `email` (optional, unique), `phone` (required, unique), `address`, `createdAt`, `updatedAt`
- **Relationships**:
  - `students`: One-to-Many (`Student[]`)

### 4. Student (`prisma/schema/student.prisma`)
- **Attributes**: `id`, `username` (unique), `password`, `name`, `surname`, `email` (optional, unique), `phone` (optional, unique), `address`, `img` (optional URL), `bloodType`, `sex`, `birthday`, `parentId`, `classId`, `gradeId`, `createdAt`, `updatedAt`
- **Relationships**:
  - `parent`: Belongs to `Parent`
  - `class`: Belongs to `Class`
  - `grade`: Belongs to `Grade`
  - `attendances`: One-to-Many (`Attendance[]`)
  - `results`: One-to-Many (`Result[]`)

### 5. Grade (`prisma/schema/grade.prisma`)
- **Attributes**: `id`, `level` (Int, unique), `createdAt`, `updatedAt`
- **Relationships**:
  - `classes`: One-to-Many (`Class[]`)
  - `students`: One-to-Many (`Student[]`)

### 6. Class (`prisma/schema/class.prisma`)
- **Attributes**: `id`, `name` (String, unique), `capacity` (Int), `supervisorId` (optional Teacher ID), `gradeId`, `createdAt`, `updatedAt`
- **Relationships**:
  - `grade`: Belongs to `Grade`
  - `supervisor`: Belongs to `Teacher` (optional)
  - `students`: One-to-Many (`Student[]`)
  - `lessons`: One-to-Many (`Lesson[]`)
  - `events`: One-to-Many (`Event[]`)
  - `announcements`: One-to-Many (`Announcement[]`)

### 7. Subject (`prisma/schema/subject.prisma`)
- **Attributes**: `id`, `name` (String, unique), `createdAt`, `updatedAt`
- **Relationships**:
  - `teachers`: Many-to-Many (`Teacher[]`)
  - `lessons`: One-to-Many (`Lesson[]`)

### 8. Lesson (`prisma/schema/lesson.prisma`)
- **Attributes**: `id`, `name` (String), `day` (DayOfWeek: MONDAY–SUNDAY), `startTime` (DateTime), `endTime` (DateTime), `subjectId`, `classId`, `teacherId`, `createdAt`, `updatedAt`
- **Relationships**:
  - `subject`: Belongs to `Subject`
  - `class`: Belongs to `Class`
  - `teacher`: Belongs to `Teacher`
  - `exams`: One-to-Many (`Exam[]`)
  - `assignments`: One-to-Many (`Assignment[]`)
  - `attendances`: One-to-Many (`Attendance[]`)

### 9. Exam (`prisma/schema/exam.prisma`)
- **Attributes**: `id`, `title` (String), `startTime` (DateTime), `endTime` (DateTime), `lessonId`, `createdAt`, `updatedAt`
- **Relationships**:
  - `lesson`: Belongs to `Lesson`
  - `results`: One-to-Many (`Result[]`)

### 10. Assignment (`prisma/schema/assignment.prisma`)
- **Attributes**: `id`, `title` (String), `startDate` (DateTime), `dueDate` (DateTime), `lessonId`, `createdAt`, `updatedAt`
- **Relationships**:
  - `lesson`: Belongs to `Lesson`
  - `results`: One-to-Many (`Result[]`)

### 11. Result (`prisma/schema/result.prisma`)
- **Attributes**: `id`, `score` (Float), `studentId`, `examId` (optional), `assignmentId` (optional), `createdAt`, `updatedAt`
- **Relationships**:
  - `student`: Belongs to `Student`
  - `exam`: Optional belongs to `Exam`
  - `assignment`: Optional belongs to `Assignment`
- **Constraints**: Exactly one of `examId` or `assignmentId` must be non-null.

### 12. Attendance (`prisma/schema/attendance.prisma`)
- **Attributes**: `id`, `date` (DateTime), `present` (Boolean), `studentId`, `lessonId`, `createdAt`, `updatedAt`
- **Relationships**:
  - `student`: Belongs to `Student`
  - `lesson`: Belongs to `Lesson`
- **Constraints**: `@@unique([studentId, lessonId, date])`

### 13. Event (`prisma/schema/event.prisma`)
- **Attributes**: `id`, `title` (String), `description` (String), `startTime` (DateTime), `endTime` (DateTime), `classId` (optional — null implies school-wide), `createdAt`, `updatedAt`
- **Relationships**:
  - `class`: Optional belongs to `Class`

### 14. Announcement (`prisma/schema/announcement.prisma`)
- **Attributes**: `id`, `title` (String), `description` (String), `date` (DateTime), `classId` (optional — null implies school-wide), `createdAt`, `updatedAt`
- **Relationships**:
  - `class`: Optional belongs to `Class`
