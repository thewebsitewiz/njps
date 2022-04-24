export interface UserData {
  name?: string | null;
  phone?: string | null;
  isAdmin?: boolean | null;
  userId?: string | null;
}

export interface LoginData {
  phone?: string | null;
  password?: string | null;
}

export interface Values {
  id?: string | null;
  phone?: string | null;
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  aptOrUnit?: string;
  zipCode: string;
  city: string;
  isAdmin: boolean;
  phone: string;
}

export interface FullUserData extends User {
  token: string;
  expiresIn: number;
  tokenExp: string;
}

