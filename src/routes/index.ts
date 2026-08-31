import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route.js";
import { AdminRoutes } from "../modules/Admin/admin.route.js";
import { TeacherRoutes } from "../modules/Teacher/teacher.route.js";
import { ParentRoutes } from "../modules/Parent/parent.route.js";
import { StudentRoutes } from "../modules/Student/student.route.js";
import { GradeRoutes } from "../modules/Grade/grade.route.js";
import { ClassRoutes } from "../modules/Class/class.route.js";
import { SubjectRoutes } from "../modules/Subject/subject.route.js";
import { LessonRoutes } from "../modules/Lesson/lesson.route.js";
import { ExamRoutes } from "../modules/Exam/exam.route.js";
import { AssignmentRoutes } from "../modules/Assignment/assignment.route.js";
import { ResultRoutes } from "../modules/Result/result.route.js";
import { AttendanceRoutes } from "../modules/Attendance/attendance.route.js";
import { EventRoutes } from "../modules/Event/event.route.js";
import { AnnouncementRoutes } from "../modules/Announcement/announcement.route.js";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/admins",
    route: AdminRoutes,
  },
  {
    path: "/teachers",
    route: TeacherRoutes,
  },
  {
    path: "/parents",
    route: ParentRoutes,
  },
  {
    path: "/students",
    route: StudentRoutes,
  },
  {
    path: "/grades",
    route: GradeRoutes,
  },
  {
    path: "/classes",
    route: ClassRoutes,
  },
  {
    path: "/subjects",
    route: SubjectRoutes,
  },
  {
    path: "/lessons",
    route: LessonRoutes,
  },
  {
    path: "/exams",
    route: ExamRoutes,
  },
  {
    path: "/assignments",
    route: AssignmentRoutes,
  },
  {
    path: "/results",
    route: ResultRoutes,
  },
  {
    path: "/attendances",
    route: AttendanceRoutes,
  },
  {
    path: "/events",
    route: EventRoutes,
  },
  {
    path: "/announcements",
    route: AnnouncementRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
