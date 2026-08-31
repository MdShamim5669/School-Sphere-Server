export type IResultFilterRequest = {
  studentId?: string;
  examId?: string;
  assignmentId?: string;
};

export type ICreateResultInput = {
  score: number;
  studentId: string;
  examId?: string;
  assignmentId?: string;
};

export type IUpdateResultInput = {
  score?: number;
};
