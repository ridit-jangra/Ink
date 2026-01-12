export interface Sheet {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  content: any[];
  isSaved: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  content: any;
  tags: string[];
  coverImage: string;
  sheets?: Sheet[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: "Female" | "Male";
  isVerified?: boolean; // ← NEW
  otp?: string; // ← NEW
  otpExpiry?: Date; // ← NEW
}
