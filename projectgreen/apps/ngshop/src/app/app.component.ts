import { Component, OnInit } from '@angular/core';
import { UsersService } from '@projectgreen/users';

@Component({
  selector: 'ngshop-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.usersService.initAppSession();
  }
  title = 'NJ Pots Shop';
}
