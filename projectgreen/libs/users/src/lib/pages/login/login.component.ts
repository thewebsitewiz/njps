import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@projectgreen/ui';

@Component({
  selector: 'users-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  loginFormGroup!: FormGroup;
  isSubmitted = false;
  authError = false;
  authMessage = 'Email or Password are wrong';

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this._initLoginForm();
  }

  private _initLoginForm() {
    this.loginFormGroup = this.formBuilder.group({
      phoneNumber: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log('submit');
    this.isSubmitted = true;

    if (this.loginFormGroup.invalid) return;

    this.auth.login(this.loginForm['phoneNumber'].value, this.loginForm['password'].value);

    this.router.navigate([''], { fragment: 'top' });



  }

  get loginForm() {
    return this.loginFormGroup.controls;
  }
}
