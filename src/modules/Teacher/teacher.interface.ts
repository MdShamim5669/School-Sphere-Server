import { BloodType, UserSex } from "@prisma/client";

export type ITeacherFilterRequest = {
  searchTerm?: string;
  bloodType?: BloodType;
  sex?: UserSex;
  subjectId?: string;
  classId?: string;
};

export type ICreateTeacherInput = {
  username: string;
  password: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  bloodType: BloodType;
  sex: UserSex;
  birthday: string;
  subjectIds?: string[];
};

export type IUpdateTeacherInput = Partial<
  Omit<ICreateTeacherInput, "username" | "password">
>;
