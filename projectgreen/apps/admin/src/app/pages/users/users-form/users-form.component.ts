import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsersService, User, UserData } from '@projectgreen/users';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';

@Component({
  selector: 'admin-users-form',
  templateUrl: './users-form.component.html',
  styles: []
})
export class UsersFormComponent implements OnInit {
  form!: FormGroup;
  isSubmitted = false;
  editmode = false;
  currentUserId!: string;
  countries: { id: string; name: string }[] = [];

  constructor(
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._initUserForm();
    this._checkEditMode();
  }

  private _initUserForm() {
    this.form = this.formBuilder.group({
      fullName: ['', Validators.required],
      password: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      isAdmin: [false],
      streetAddress: ['', Validators.required],
      aptOrUnit: [''],
      zipCode: ['', Validators.required],
      city: ['', Validators.required]
    });
  }

  private _addUser(user: User) {
    this.usersService.createUser(user).subscribe(
      (user: User) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User ${user.fullName} is created!`
        });
        timer(2000)
          .toPromise()
          .then(() => {
            this.location.back();
          });
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User is not created!'
        });
      }
    );
  }

  private _updateUser(user: User) {
    this.usersService.updateUser(user).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User is updated!'
        });
        timer(2000)
          .toPromise()
          .then(() => {
            this.location.back();
          });
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User is not updated!'
        });
      }
    );
  }

  private _checkEditMode() {
    this.route.params.subscribe((params: any) => {
      if (params.id) {
        this.editmode = true;
        this.currentUserId = params.id;
        this.usersService.getUser(params.id).subscribe((user: UserData) => {
          this.userForm['fullName'].setValue(user.fullName);
          this.userForm['phoneNumber'].setValue(user.phoneNumber);
          this.userForm['isAdmin'].setValue(user.isAdmin);
          this.userForm['streetAddress'].setValue(user.streetAddress);
          this.userForm['aptOrUnit'].setValue(user.aptOrUnit);
          this.userForm['zipCode'].setValue(user.zipCode);
          this.userForm['city'].setValue(user.city);
          this.userForm['password'].setValue(user.password);
          // this.userForm['password'].updateValueAndValidity();
        });
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    const user: UserData = {
      id: this.currentUserId,
      fullName: this.userForm['fullName'].value,
      password: this.userForm['password'].value,
      phoneNumber: this.userForm['phoneNumber'].value,
      isAdmin: this.userForm['isAdmin'].value,
      streetAddress: this.userForm['streetAddress'].value,
      aptOrUnit: this.userForm['aptOrUnit'].value,
      zipCode: this.userForm['zipCode'].value,
      city: this.userForm['city'].value
    };
    if (this.editmode) {
      this._updateUser(user);
    } else {
      this._addUser(user);
    }
  }

  onCancel() {
    this.location.back();
  }

  get userForm() {
    return this.form.controls;
  }
}
