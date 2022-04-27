import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user-data.model';
import { Router } from '@angular/router';

@Component({
  selector: 'ui-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  phoneNumber!: string;
  password!: string;

  isLoading = false;
  private authStatusSub!: Subscription;
  isAuth: boolean = false;

  private userInfoSub!: Subscription;
  userInfo!: User | null;

  constructor(private authService: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isAuth = authStatus;

        if (this.isAuth) {
          this.userInfoSub = this.authService.getUserDataListener().subscribe(
            userInfo => {
              this.userInfo = userInfo;
            }
          );
        }
      }
    );

  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(form.value.phoneNumber, form.value.password);

    this.router.navigate(['/'], { fragment: 'top' });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();

    if (!!this.userInfoSub) {
      this.userInfoSub.unsubscribe();
    }
  }

}
