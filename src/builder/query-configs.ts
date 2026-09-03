import { IQueryConfig } from "../interface/query.interface.js";

export const teacherQueryConfig: IQueryConfig = {
  searchableFields: ["name", "surname", "email", "phone", "username", "address"],
  filterableFields: ["sex", "bloodType", "subjects.some.id", "supervisedClasses.some.id"],
  dateFields: ["birthday", "createdAt"],
};

export const studentQueryConfig: IQueryConfig = {
  searchableFields: ["name", "surname", "username", "email", "phone", "parent.name"],
  filterableFields: ["classId", "gradeId", "parentId", "sex", "bloodType"],
  dateFields: ["birthday", "createdAt"],
};

export const parentQueryConfig: IQueryConfig = {
  searchableFields: ["name", "surname", "email", "phone", "username"],
  filterableFields: [],
  dateFields: ["createdAt"],
};

export const classQueryConfig: IQueryConfig = {
  searchableFields: ["name", "supervisor.name", "supervisor.surname"],
  filterableFields: ["gradeId", "supervisorId", "capacity"],
  numberFields: ["capacity"],
};

export const subjectQueryConfig: IQueryConfig = {
  searchableFields: ["name"],
  filterableFields: ["teachers.some.id"],
};

export const lessonQueryConfig: IQueryConfig = {
  searchableFields: ["name", "subject.name", "teacher.name", "class.name"],
  filterableFields: ["day", "classId", "teacherId", "subjectId"],
  dateFields: ["startTime", "endTime"],
};

export const examQueryConfig: IQueryConfig = {
  searchableFields: ["title", "lesson.name", "lesson.subject.name"],
  filterableFields: ["lessonId"],
  dateFields: ["startTime", "endTime"],
};

export const assignmentQueryConfig: IQueryConfig = {
  searchableFields: ["title", "lesson.name"],
  filterableFields: ["lessonId"],
  dateFields: ["startDate", "dueDate"],
};

export const resultQueryConfig: IQueryConfig = {
  searchableFields: ["student.name", "student.surname"],
  filterableFields: ["studentId", "examId", "assignmentId", "score"],
  numberFields: ["score"],
};

export const attendanceQueryConfig: IQueryConfig = {
  searchableFields: ["student.name", "student.surname"],
  filterableFields: ["date", "present", "studentId", "lessonId"],
  booleanFields: ["present"],
  dateFields: ["date"],
};

export const eventQueryConfig: IQueryConfig = {
  searchableFields: ["title", "description"],
  filterableFields: ["classId"],
  dateFields: ["startTime", "endTime"],
};

export const announcementQueryConfig: IQueryConfig = {
  searchableFields: ["title", "description"],
  filterableFields: ["classId"],
  dateFields: ["date"],
};
