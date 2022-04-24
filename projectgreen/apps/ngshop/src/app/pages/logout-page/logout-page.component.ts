import { Component, OnInit } from '@angular/core';
import { AuthService } from '@projectgreen/ui';

@Component({
  selector: 'njps-logout',
  templateUrl: './logout-page.component.html'
})
export class LogoutPageComponent implements OnInit {


  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.logout();
  }

}
