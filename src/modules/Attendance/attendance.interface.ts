export type IAttendanceFilterRequest = {
  studentId?: string;
  lessonId?: string;
  date?: string;
};

export type ICreateAttendanceInput = {
  date: string;
  present: boolean;
  studentId: string;
  lessonId: string;
};

export type IUpdateAttendanceInput = {
  present: boolean;
};
