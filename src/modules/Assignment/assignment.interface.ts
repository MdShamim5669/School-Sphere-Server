export type ICreateAssignmentInput = {
  title: string;
  startDate: string;
  dueDate: string;
  lessonId: string;
};

export type IUpdateAssignmentInput = Partial<ICreateAssignmentInput>;

export type IAssignmentFilterRequest = {
  searchTerm?: string;
  title?: string;
  lessonId?: string;
};

