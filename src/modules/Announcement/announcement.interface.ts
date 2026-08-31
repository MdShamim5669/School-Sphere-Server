export type ICreateAnnouncementInput = {
  title: string;
  description: string;
  date: string;
  classId?: string;
};

export type IUpdateAnnouncementInput = Partial<ICreateAnnouncementInput>;

export type IAnnouncementFilterRequest = {
  searchTerm?: string;
  title?: string;
  classId?: string;
};

