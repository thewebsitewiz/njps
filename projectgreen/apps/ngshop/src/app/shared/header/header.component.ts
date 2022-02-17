import { Component } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'ngshop-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  items!: MenuItem[];

  constructor(private primengConfig: PrimeNGConfig) { }

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.items = [
      { label: 'Home', icon: 'icon product-icon', routerLink: ['/'] },
      { label: 'Flower', icon: 'icon product-icon', routerLink: ['/products'] },
      { label: 'Designer Flower', icon: 'icon product-icon', routerLink: ['/products'] },
      { label: 'Pre Rolls', icon: 'icon product-icon', routerLink: ['/products'] },
      { label: 'Edibles', icon: 'icon product-icon', routerLink: ['/products'] },
      { label: 'Concentrtes', icon: 'icon specials-icon' },
      { label: 'Carts', icon: 'icon specials-icon' },
      { label: 'FAQ', icon: 'icon faq-icon' },
      { label: 'Contact', icon: 'icon contact-icon' },
      { label: 'Login', icon: 'icon contact-icon' },
      { label: 'Register', icon: 'icon contact-icon' },
    ];

  }

  update() { }

  delete() { }

}
