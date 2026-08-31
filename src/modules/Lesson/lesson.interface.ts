import { DayOfWeek } from "@prisma/client";

export type ILessonFilterRequest = {
  searchTerm?: string;
  name?: string;
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  day?: DayOfWeek;
};

export type ICreateLessonInput = {
  name: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  subjectId: string;
  classId: string;
  teacherId: string;
};

export type IUpdateLessonInput = Partial<ICreateLessonInput>;
