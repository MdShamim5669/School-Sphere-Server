export type ICreateEventInput = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  classId?: string;
};

export type IUpdateEventInput = Partial<ICreateEventInput>;

export type IEventFilterRequest = {
  searchTerm?: string;
  title?: string;
  classId?: string;
};

