export type ICreateClassInput = {
  name: string;
  capacity: number;
  gradeId: string;
  supervisorId?: string;
};

export type IUpdateClassInput = Partial<ICreateClassInput>;

export type IClassFilterRequest = {
  searchTerm?: string;
  name?: string;
  gradeId?: string;
  supervisorId?: string;
};

