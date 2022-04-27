import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { environment } from "@env/environment";
import { Values, LoginData, User, FullUserData } from "../models/user-data.model";
import { SignUpData } from "../models/sign-up.model";

const BACKEND_URL = `${environment.apiUrl}users`;

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token!: string | null;
  private tokenTimer: any;
  private id: string | null | undefined = null;
  private authStatusListener = new Subject<boolean>();
  private userDataListener = new Subject<User | null>();
  private userData!: User | null;
  private userIsAdmin: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }
  // user$: BehaviorSubject<User | undefined> = new BehaviorSubject(this.autoUserData());


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

    if (data.id !== null) {
      const userData = { id: data.id };

      this.http
        .get<User>(`${BACKEND_URL}/${data.id}`).subscribe((result: any) => {
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
    return this.id;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(fullName: string,
    streetAddress: string,
    aptOrUnit: string,
    city: string,
    zipCode: number,
    phoneNumber: string,
    password: string) {

    const signUpData: SignUpData = {
      fullName: fullName,
      streetAddress: streetAddress,
      aptOrUnit: aptOrUnit,
      city: city,
      zipCode: zipCode,
      phoneNumber: phoneNumber,
      password: password
    };

    return this.http.post(BACKEND_URL + "/", signUpData);
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
            this.id = response.id;

            this.setAuthTimer(response.expiresIn);
            this.isAuthenticated = true;

            this.userIsAdmin = response.isAdmin;

            this.userData = response;
            console.log('this.userData: ', this.userData);

            this.userDataListener.next(this.userData);

            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + response.expiresIn * 1000
            );

            if (response.id !== undefined) {
              this.saveAuthData(response.token, expirationDate, response.id);
            }

            console.log('about to navigate')
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
      const values: Values = { id: authInformation.id, phone: null }
      this.isUserAdmin(values);
      this.token = authInformation.token!;
      this.isAuthenticated = true;
      this.id = authInformation.id;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      return;
    }
    return;
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userDataListener.next(null);
    this.userIsAdmin = false;
    this.id = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, id: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("id", id.toString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("id");
  }

  getUserData() {
    return this.userData;
  }

  autoUserData(id: string) {
    return this.http.get<User>(`${BACKEND_URL}/${id}`);
  }

  private getAuthData(): { token: string | null, expirationDate: Date | null, id: string | null } {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const idString = localStorage.getItem("id");
    let id;

    if (!token || !expirationDate) {
      return {
        token: null,
        expirationDate: null,
        id: null
      };
    }

    if (idString !== null) {
      id = idString;
    }
    else {
      id = null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      id: id
    };
  }

  isUserLoggedIn(): boolean {
    if (!!this.id) {
      return true;
    }
    return false;
  }

  getLocalId() {
    return localStorage.getItem("id");
  }

}

function asObservable(arg0: boolean): void {
  throw new Error("Function not implemented.");
}

