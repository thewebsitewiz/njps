import { Component } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';

import { CategoriesService, Categories, Category } from '@projectgreen/products';

import { Cart, CartService } from '@projectgreen/orders';
import { Router } from '@angular/router';

@Component({
  selector: 'ngshop-header',
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {

  items!: MenuItem[];

  cartCountLength = 0;
  cartCount: number = 0;

  categories!: { [key: string]: Category };
  categoryName!: string | undefined;

  constructor(private primengConfig: PrimeNGConfig,
    private categoriesService: CategoriesService,
    private cartService: CartService,
    private router: Router) { }

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.cartService.initCartLocalStorage();

    this._getCategories();

    this.cartService.cart$.subscribe((cart) => {
      this.cartCount = 0;
      if (cart.items !== undefined) {
        cart.items.forEach((cart) => {
          if (cart.unitType === 'Gram') {
            this.cartCount++;
          }
          if ((cart.unitType === 'Item' || cart.unitType === 'Package') && cart.amount !== undefined) {
            this.cartCount = this.cartCount + cart.amount;
          }
        })
      }
    });




  }

  goToCart() {
    console.log('cart')
    this.router.navigateByUrl('cart');
  }


  private _getCategories() {
    this.categories = {};
    this.categoriesService.getCategories().subscribe((results) => {
      results.forEach((cat: Category) => {
        const name = cat['name'];
        this.categories[name] = cat;
      });

      this.items = [
        { label: 'Home', icon: 'icon product-icon', routerLink: ['/'] },
        { label: 'Flower', icon: 'icon product-icon', routerLink: [`/category/${this.categories['Flower'].id}`] },
        { label: 'Designer Flower', icon: 'icon designer-icon', routerLink: [`/category/${this.categories['Designer Flower'].id}`] },
        { label: 'Pre Rolls', icon: 'icon pre-roll-icon', routerLink: ['/category/' + this.categories['Pre Rolls'].id] },
        { label: 'Edibles', icon: 'icon edible-icon', routerLink: ['/category/' + this.categories['Edibles'].id] },
        { label: 'Concentrates', icon: 'icon concentrate-icon', routerLink: ['/category/' + this.categories['Concentrates'].id] },
        { label: 'Carts', icon: 'icon cartridge-icon', routerLink: ['/category/' + this.categories['Carts'].id] },
        { label: 'FAQ', icon: 'icon faq-icon', routerLink: ['/faq'] },
        { label: 'Contact', icon: 'icon contact-icon', routerLink: ['/contact'] },
        { label: 'Login', icon: 'icon login-icon', routerLink: ['/userlogin'] },
        { label: 'Register', icon: 'icon register-icon', routerLink: ['/register'] },
      ];
    });
  }




  update() { }

  delete() { }

}
