# School Sphere API Routes & RBAC Permission Matrix

All endpoints are prefixed with `/api/v1`.

## 1. Authentication
| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user (Teacher/Parent/Student) | Yes | `ADMIN` |
| `POST` | `/auth/login` | Login with username & password | No | Public |
| `POST` | `/auth/refresh-token`| Refresh access token via httpOnly cookie | No | Public (Cookie) |

---

## 2. Teachers Management
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/teachers` | Create a new teacher | `ADMIN` |
| `GET` | `/teachers` | Get all teachers (paginate/filter/search) | `ADMIN` |
| `GET` | `/teachers/:id` | Get teacher by ID | `ADMIN`, `TEACHER` (self) |
| `PATCH` | `/teachers/:id` | Update teacher details | `ADMIN` |
| `DELETE`| `/teachers/:id` | Delete teacher | `ADMIN` |
| `POST` | `/teachers/:id/image` | Upload/replace profile image | `ADMIN`, `TEACHER` (self) |
| `DELETE`| `/teachers/:id/image` | Remove profile image | `ADMIN`, `TEACHER` (self) |

---

## 3. Parents Management
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/parents` | Create parent profile | `ADMIN` |
| `GET` | `/parents` | Get all parents (paginate/filter/search) | `ADMIN` |
| `GET` | `/parents/:id` | Get parent by ID | `ADMIN`, `PARENT` (self) |
| `PATCH` | `/parents/:id` | Update parent profile | `ADMIN` |
| `DELETE`| `/parents/:id` | Delete parent | `ADMIN` |

---

## 4. Students Management
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/students` | Create student record | `ADMIN` |
| `GET` | `/students` | Get all students (paginate/filter/search)| `ADMIN`, `TEACHER` |
| `GET` | `/students/:id` | Get student by ID | `ADMIN`, `TEACHER`, `PARENT` (child), `STUDENT` (self) |
| `PATCH` | `/students/:id` | Update student profile & class | `ADMIN` |
| `DELETE`| `/students/:id` | Delete student | `ADMIN` |
| `POST` | `/students/:id/image` | Upload/replace profile image | `ADMIN` |
| `DELETE`| `/students/:id/image` | Remove profile image | `ADMIN` |

---

## 5. Academic Structure (Grades, Classes, Subjects)
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/grades` | Create grade level | `ADMIN` |
| `GET` | `/grades` | Get all grades | Authenticated (`ALL`) |
| `POST` | `/classes` | Create class section | `ADMIN` |
| `GET` | `/classes` | Get all classes | Authenticated (`ALL`) |
| `GET` | `/classes/:id` | Get class details | Authenticated (`ALL`) |
| `PATCH` | `/classes/:id` | Update class details/supervisor | `ADMIN` |
| `DELETE`| `/classes/:id` | Delete class | `ADMIN` |
| `POST` | `/subjects` | Create subject | `ADMIN` |
| `GET` | `/subjects` | Get all subjects | Authenticated (`ALL`) |
| `PATCH` | `/subjects/:id` | Update subject | `ADMIN` |
| `DELETE`| `/subjects/:id` | Delete subject | `ADMIN` |

---

## 6. Lessons & Scheduling
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/lessons` | Create lesson (conflict-checked) | `ADMIN` |
| `GET` | `/lessons` | Get lessons (filter by class/teacher/day) | `ADMIN`, `TEACHER`, `PARENT`, `STUDENT` |
| `GET` | `/lessons/:id` | Get lesson by ID | `ADMIN`, `TEACHER`, `PARENT`, `STUDENT` |
| `PATCH` | `/lessons/:id` | Update lesson (conflict-checked) | `ADMIN` |
| `DELETE`| `/lessons/:id` | Delete lesson | `ADMIN` |

---

## 7. Exams & Assignments
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/exams` | Create exam for a lesson | `TEACHER` (assigned), `ADMIN` |
| `GET` | `/exams` | Get all exams | Authenticated (`ALL`) |
| `PATCH` | `/exams/:id` | Update exam | `TEACHER` (assigned), `ADMIN` |
| `DELETE`| `/exams/:id` | Delete exam | `TEACHER` (assigned), `ADMIN` |
| `POST` | `/assignments` | Create assignment for a lesson | `TEACHER` (assigned), `ADMIN` |
| `GET` | `/assignments` | Get all assignments | Authenticated (`ALL`) |
| `PATCH` | `/assignments/:id`| Update assignment | `TEACHER` (assigned), `ADMIN` |
| `DELETE`| `/assignments/:id`| Delete assignment | `TEACHER` (assigned), `ADMIN` |

---

## 8. Results & Attendance
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/results` | Record result (Exam XOR Assignment) | `TEACHER` (assigned), `ADMIN` |
| `GET` | `/results` | Get results (filter by student/exam/assignment) | `ADMIN`, `TEACHER`, `PARENT` (child), `STUDENT` (self) |
| `PATCH` | `/results/:id` | Update score | `TEACHER` (assigned), `ADMIN` |
| `DELETE`| `/results/:id` | Delete score | `ADMIN` |
| `POST` | `/attendances` | Mark student attendance | `TEACHER` (assigned), `ADMIN` |
| `GET` | `/attendances` | Get attendance records | `ADMIN`, `TEACHER`, `PARENT` (child), `STUDENT` (self) |
| `PATCH` | `/attendances/:id`| Update attendance entry | `TEACHER` (assigned), `ADMIN` |

---

## 9. Events & Announcements
| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/events` | Create event (school-wide or class) | `ADMIN`, `TEACHER` (own class) |
| `GET` | `/events` | Get events | Authenticated (`ALL`) |
| `PATCH` | `/events/:id` | Update event | `ADMIN` |
| `DELETE`| `/events/:id` | Delete event | `ADMIN` |
| `POST` | `/announcements` | Create announcement | `ADMIN`, `TEACHER` (own class) |
| `GET` | `/announcements` | Get announcements | Authenticated (`ALL`) |
| `PATCH` | `/announcements/:id`| Update announcement | `ADMIN` |
| `DELETE`| `/announcements/:id`| Delete announcement | `ADMIN` |
