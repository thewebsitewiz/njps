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
  userId?: string | null;
  phone?: string | null;
}

export interface User {
  userId?: string;
  name: string;
  phoneNumber: string;
  streetAddress: string;
  aptOrUnit?: string;
  zipCode: string;
  city: string;
  isAdmin: boolean;
  phone: string;
  password?: string;
}

export interface FullUserData extends User {
  token: string;
  expiresIn: number;
  tokenExp: string;
}

/* name: response.name,
            phoneNumber: response.phoneNumber,
            isAdmin: response.isAdmin,
            accountId: this.accountId */
