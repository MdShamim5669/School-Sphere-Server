export type ICreateSubjectInput = {
  name: string;
  teacherIds?: string[];
};

export type IUpdateSubjectInput = Partial<ICreateSubjectInput>;

export type ISubjectFilterRequest = {
  searchTerm?: string;
  name?: string;
};

