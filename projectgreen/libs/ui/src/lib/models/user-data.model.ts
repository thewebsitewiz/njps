export interface UserData {
  name?: string | null;
  phoneNumber?: string | null;
  isAdmin?: boolean | null;
  accountId?: number | null;
}

export interface LoginData {
  phoneNumber?: string | null;
  password?: string | null;
}

export interface Values {
  id?: number | null;
  phoneNumber?: string | null;
}

/* name: response.name,
            phoneNumber: response.phoneNumber,
            isAdmin: response.isAdmin,
            accountId: this.accountId */
