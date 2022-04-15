import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ui-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  phone!: string;
  password!: string;

  isLoading = false;
  private authStatusSub!: Subscription;

  constructor(public router: Router,
    public authService: AuthService,
    private http: HttpClient) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );

  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(form.value.phone, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
