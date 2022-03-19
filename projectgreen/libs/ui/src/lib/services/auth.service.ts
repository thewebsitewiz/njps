import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { environment } from "@env/environment";
import { Values, UserData, LoginData } from "../models/user-data.model";
import { SignUpData } from "../models/sign-up.model";

const BACKEND_URL = `${environment.apiUrl}/users`;

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token!: string | null;
  private tokenTimer: any;
  private accountId: number | null = null;
  private authStatusListener = new Subject<boolean>();
  private userDataListener = new Subject<UserData>();
  private userData!: UserData;
  private userIsAdmin: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  getIsAdmin() {
    return this.userIsAdmin;
  }

  getUserDataListener() {
    return this.userDataListener.asObservable();
  }

  private isUserAdmin(data: Values) {
    if (data.id === undefined) {
      this.accountId = null;
    }
    else {
      this.accountId = data.id;
    }

    if (data.phoneNumber !== null) {
      const userData = { phoneNumber: data.phoneNumber };
      this.http
        .post<{ user: string, phoneNumber: string, isAdmin: boolean }>(
          BACKEND_URL + "/is-admin",
          userData
        ).subscribe((result: any) => {

          this.userIsAdmin = result.isAdmin;
          this.userDataListener.next({
            name: result.name,
            phoneNumber: result.phoneNumber,
            isAdmin: result.userIsAdmin
          });

        });
      return;
    }

    if (data.id !== null) {
      const userData = { accountId: data.id };
      this.http
        .post<{ user: string, phoneNumber: string, isAdmin: boolean }>(
          BACKEND_URL + "/is-admin",
          userData
        ).subscribe((result: any) => {
          this.userIsAdmin = result.isAdmin;
          this.userDataListener.next({
            name: result.name,
            phoneNumber: result.phoneNumber,
            isAdmin: result.userIsAdmin
          });

        });
      return;
    }

    return;
  }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAccountId() {
    return this.accountId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(name: string, phoneNumber: string, password: string) {
    const signUpData: SignUpData = { name: name, phoneNumber: phoneNumber, password: password };
    this.http.post(BACKEND_URL + "/signup", signUpData).subscribe(
      () => {
        this.router.navigate(["/"]);
      },
      error => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(phoneNumber: string, password: string) {
    const authData: LoginData = { phoneNumber: phoneNumber, password: password };
    this.http
      .post<{ token: string; expiresIn: number; accountId: string; isAdmin: boolean; name: string }>(
        BACKEND_URL + "/login",
        authData
      )
      .subscribe(
        response => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.accountId = parseInt(response.accountId, 10);

            this.userIsAdmin = response.isAdmin;

            this.userData = {
              name: response.name,
              phoneNumber: phoneNumber,
              isAdmin: response.isAdmin,
              accountId: this.accountId
            }

            this.userDataListener.next(this.userData);

            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(token, expirationDate, this.accountId);
            this.router.navigate(['/'], { fragment: 'top' });
          }
        },
        error => {
          this.userData = {};
          this.authStatusListener.next(false);
        }
      );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (Object.keys(authInformation).length === 0) {
      this.clearAuthData();
      return;
    }

    if (authInformation.expirationDate === null) {
      this.clearAuthData();
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate!.getTime() - now.getTime();
    if (expiresIn > 0) {
      const values: Values = { id: authInformation.accountId, phoneNumber: null }
      this.isUserAdmin(values);
      this.token = authInformation.token!;
      this.isAuthenticated = true;
      this.accountId = authInformation.accountId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      return;
    }

    this.clearAuthData();
    return;
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userDataListener.next({
      name: null,
      phoneNumber: null,
      isAdmin: false
    });
    this.userIsAdmin = false;
    this.accountId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, accountId: number) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("accountId", accountId.toString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("accountId");
  }


  getUserData() {
    return this.userData;
  }

  autoUserData() {
    const accountId = localStorage.getItem("accountId");

    if (!accountId) {
      return;
    }

    const data = {
      accountId: accountId
    };

    this.http
      .post<{ name: string, phoneNumber: string, isAdmin: boolean }>(
        BACKEND_URL + "/user-data",
        data
      )
      .subscribe(
        response => {
          this.userIsAdmin = response.isAdmin;
          this.userDataListener.next({
            name: response.name,
            phoneNumber: response.phoneNumber,
            isAdmin: response.isAdmin
          });

          this.userData = {
            name: response.name,
            phoneNumber: response.phoneNumber,
            isAdmin: response.isAdmin,
            accountId: this.accountId
          }

        },
        error => {
          this.userIsAdmin = false;
          this.userDataListener.next({
            name: null,
            phoneNumber: null,
            isAdmin: false
          });
        }
      );

  }


  private getAuthData(): { token: string | null, expirationDate: Date | null, accountId: number | null } {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const accountIdString = localStorage.getItem("accountId");
    let accountId;

    if (!token || !expirationDate) {
      return {
        token: null,
        expirationDate: null,
        accountId: null
      };
    }

    if (accountIdString !== null) {
      accountId = parseInt(accountIdString, 10);
    }
    else {
      accountId = null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      accountId: accountId
    };
  }
}

