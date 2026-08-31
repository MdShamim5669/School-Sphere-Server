import { BloodType, UserSex } from "@prisma/client";

export type IStudentFilterRequest = {
  searchTerm?: string;
  bloodType?: BloodType;
  sex?: UserSex;
  classId?: string;
  gradeId?: string;
  parentId?: string;
};

export type ICreateStudentInput = {
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
  parentId: string;
  classId: string;
  gradeId: string;
};

export type IUpdateStudentInput = Partial<
  Omit<ICreateStudentInput, "username" | "password">
>;
