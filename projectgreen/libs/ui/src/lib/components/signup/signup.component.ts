import { Component, OnInit, OnDestroy } from '@angular/core';

import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

import { DeliveryService } from '@projectgreen/orders';

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
  streetAddress!: string;
  aptOrUnit!: string;
  city!: string;
  zipCode!: string;
  phoneNumber!: string;
  password!: string;

  isAuth: boolean = false;

  constructor(private authService: AuthService,
    private deliveryService: DeliveryService) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isAuth = authStatus;
      }
    );
  }


  onSignup(form: NgForm) {

    console.log(form.value.fullName,
      form.value.streetAddress,
      form.value.aptOrUnit,
      form.value.city,
      form.value.zipCode,
      form.value.phoneNumber,
      form.value.password);


    if (form.invalid) {
      console.log('nope: ', form.invalid)
      return;
    }
    this.isLoading = true;


    this.authService.createUser(form.value.fullName,
      form.value.streetAddress,
      form.value.aptOrUnit,
      form.value.city,
      form.value.zipCode,
      form.value.phoneNumber,
      form.value.password);
  }

  onKey(event: any) {
    if (event.key.match(/[0-9]/)) {
      this.zipCode += event.key;
    }

    if (event.key === 'Backspace' && this.zipCode.length > 0) {
      this.zipCode = this.zipCode.slice(0, -1);
    }
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

