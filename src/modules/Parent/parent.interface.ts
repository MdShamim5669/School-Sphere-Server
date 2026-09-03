export type IParentFilterRequest = {
  searchTerm?: string;
};

export type ICreateParentInput = {
  username: string;
  password: string;
  name: string;
  surname: string;
  email?: string;
  phone: string;
  address: string;
  studentIds?: string[];
};

export type IUpdateParentInput = Partial<
  Omit<ICreateParentInput, "username" | "password">
> & {
  studentIds?: string[];
};
