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
      { label: 'Products', icon: 'icon product-icon' },
      { label: 'Specials', icon: 'icon specials-icon' },
      { label: 'FAQ', icon: 'icon faq-icon' },
      { label: 'Contact', icon: 'icon contact-icon' },
      { label: 'Login', icon: 'icon contact-icon' },
      { label: 'Register', icon: 'icon contact-icon' },
      { label: 'Cart', icon: 'icon contact-icon' }
    ];

  }

  update() { }

  delete() { }

}
