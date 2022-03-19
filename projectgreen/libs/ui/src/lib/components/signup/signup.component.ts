import { Component, OnInit, OnDestroy } from '@angular/core';

import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'ui-signup',
  templateUrl: './signup.component.html',
  styles: []
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub!: Subscription;

  public signUpProblems!: string | null;

  fullName!: string;
  phoneNumber!: string;
  password!: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }


  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.name, form.value.signUpPhoneNumber, form.value.signUpPassword);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}










/*
    onSubmit(formValues: NgForm) {

        const signup: SignUp = {
            phoneNumber: formValues.value.phoneNumber,
            name: formValues.value.name,
            password: formValues.value.password
        }

        this.signUpSubscription = this.userService
            .getSignUpListener()
            .subscribe(subscriptionResponse => {

                this.response = subscriptionResponse;
                console.log('in component: ', this.response);

                if (this.response.phoneNumberStatus === 'exists') {
                    this.signUpProblems = 'That phone number already exists. If you do not remember your password you can click on Forgot Password'
                }
                else {
                    this.userService.signup(signup);
                }
            });



    }

    ngOnDestroy() {
        this.signUpSubscription.unsubscribe();
    } */

