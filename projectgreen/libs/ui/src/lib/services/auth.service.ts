import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";

import { environment } from "@env/environment";
import { Values, LoginData, User, FullUserData } from "../models/user-data.model";
import { SignUpData } from "../models/sign-up.model";

const BACKEND_URL = `${environment.apiUrl}users`;

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token!: string | null;
  private tokenTimer: any;
  private userId: string | null | undefined = null;
  private authStatusListener = new Subject<boolean>();
  private userDataListener = new Subject<User | null>();
  private userData!: User | null;
  private userIsAdmin: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }
  user$: BehaviorSubject<User | undefined> = new BehaviorSubject(this.autoUserData());


  getIsAdmin() {
    return this.userIsAdmin;
  }

  getUserDataListener() {
    return this.userDataListener.asObservable();
  }

  private isUserAdmin(data: Values) {
    if (data.phone !== null) {
      const userData = { phone: data.phone };
      this.http
        .get<User>(`${BACKEND_URL}/phone-number/${data.phone}`).subscribe((result: any) => {
          this.userIsAdmin = result.isAdmin;
          result.password = null;
          this.userDataListener.next(result);
        });
      return;
    }

    if (data.userId !== null) {
      const userData = { userId: data.userId };
      this.http
        .get<User>(`${BACKEND_URL}/user-id/${data.userId}`).subscribe((result: any) => {
          this.userIsAdmin = result.isAdmin;
          result.password = null;
          this.userDataListener.next(result);

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

  getuserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(fullName: string,
    streetAddress: string,
    aptOrUnit: string,
    city: string,
    zipCode: number,
    phone: number,
    password: string) {

    const signUpData: SignUpData = {
      fullName: fullName,
      streetAddress: streetAddress,
      aptOrUnit: aptOrUnit,
      city: city,
      zipCode: zipCode,
      phone: phone,
      password: password
    };

    console.log(signUpData)

    this.http.post(BACKEND_URL + "/", signUpData).subscribe(
      () => {
        this.router.navigate(["/"]);
      },
      error => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(phone: string, password: string) {
    const authData: LoginData = { phone: phone, password: password };
    this.http
      .post<FullUserData>(
        BACKEND_URL + "/login",
        authData
      )
      .subscribe(
        (response) => {

          if (response.token) {
            this.token = response.token;
            this.userId = response.userId;

            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;

            this.userIsAdmin = response.isAdmin;

            response.password = undefined;
            delete response.password;

            this.userData = response;

            this.userDataListener.next(this.userData);

            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );

            if (response.userId !== undefined) {
              this.saveAuthData(response.token, expirationDate, response.userId);
            }

            this.router.navigate(['/'], { fragment: 'top' });
          }
        },
        (e) => {
          this.userData = null;
          this.authStatusListener.next(false);
        });
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
      const values: Values = { userId: authInformation.userId, phone: null }
      this.isUserAdmin(values);
      this.token = authInformation.token!;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
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
    this.userDataListener.next(null);
    this.userIsAdmin = false;
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    console.log('file: auth.service.ts ~ line 223 ~ AuthService ~ saveAuthData ~ expirationDate', expirationDate);
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId.toString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  getUserData() {
    return this.userData;
  }

  autoUserData(): User | undefined {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      return undefined;
    }

    const data = {
      userId: userId
    };

    this.http
      .get<User>(`${BACKEND_URL}/${userId}`)
      .subscribe(
        (response: User) => {
          this.userIsAdmin = response.isAdmin;

          this.userData = response;
          this.userDataListener.next(this.userData);
          return response;
        },
        (error) => {
          this.userIsAdmin = false;
          this.userDataListener.next(null);
          return undefined;
        }
      );

    return undefined;
  }

  private getAuthData(): { token: string | null, expirationDate: Date | null, userId: string | null } {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userIdString = localStorage.getItem("userId");
    let userId;

    if (!token || !expirationDate) {
      return {
        token: null,
        expirationDate: null,
        userId: null
      };
    }

    if (userIdString !== null) {
      userId = userIdString;
    }
    else {
      userId = null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }

  isUserLoggedIn(): boolean {
    if (!!this.userId) {
      return true;
    }
    return false;
  }

}

