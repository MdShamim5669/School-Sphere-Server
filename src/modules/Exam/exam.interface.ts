export type ICreateExamInput = {
  title: string;
  startTime: string;
  endTime: string;
  lessonId: string;
};

export type IUpdateExamInput = Partial<ICreateExamInput>;

export type IExamFilterRequest = {
  searchTerm?: string;
  title?: string;
  lessonId?: string;
};

