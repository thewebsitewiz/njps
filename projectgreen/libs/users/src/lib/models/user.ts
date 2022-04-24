export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  token?: string;
  isAdmin: boolean;
  streetAddress: string;
  aptOrUnit?: string;
  zipCode: string;
  city: string;
}


export interface UserData {
  id: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  token?: string;
  isAdmin: boolean;
  streetAddress: string;
  aptOrUnit?: string;
  zipCode: string;
  city: string;
}




