export interface User {
  id: string;
  fullName: string;
  password: string;
  phoneNumber: number;
  token?: string;
  isAdmin: boolean;
  streetAddress: string;
  aptOrUnit?: string;
  zipCode: number;
  city: string;
}
