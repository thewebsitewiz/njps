import { MenuItem, PrimeNGConfig } from 'primeng/api';

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartService } from '@projectgreen/orders';
import { Categories, CategoriesService, Category } from '@projectgreen/products';

@Component({
  selector: 'admin-header',
  templateUrl: './header.component.html'
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

    this._getMenu();

    this.cartService.cart$.subscribe((cart) => {
      this.cartCount = 0;
      if (cart.items !== undefined) {
        cart.items.forEach((cart) => {
          if (cart.unitType === 'gram') {
            this.cartCount++;
          }
          if (cart.unitType === 'Item' && cart.amount !== undefined) {
            this.cartCount = this.cartCount + cart.amount;
          }
        })
      }
    });


  }

  goToCart() {
    this.router.navigateByUrl('cart');
  }

  private _getMenu() {
    this.items = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'] },
      { label: 'Products', icon: 'pi pi-briefcase', routerLink: ['/products'] },
      { label: 'Check In', icon: 'pi pi-check-square', routerLink: ['/checkin'] },
      { label: 'Inventory', icon: 'pi pi-book', routerLink: ['/inventory'] },
      // { label: 'Categories', icon: 'pi pi-list', routerLink: ['/categories'] },
      { label: 'Orders', icon: 'pi pi-shopping-cart', routerLink: ['/orders'] },
      { label: 'Delivery', icon: 'pi pi-compass', routerLink: ['/delivery'] },
      { label: 'Users', icon: 'pi pi-users', routerLink: ['/users'] },
      { label: 'FAQ', icon: 'pi pi-question-circle', routerLink: ['/faq'] },
      { label: 'Contact', icon: 'pi pi-phone', routerLink: ['/contact'] },
      { label: 'Logout', icon: 'pi pi-sign-out', routerLink: ['/login'] }
    ];
  }

  update() { }

  delete() { }

}
