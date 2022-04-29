import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs/internal/Subscription';

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartService } from '@projectgreen/orders';
import { Categories, CategoriesService, Category } from '@projectgreen/products';
import { AuthService } from '@projectgreen/ui';
import { User } from '@projectgreen/users';

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
  itemsLength!: number;

  authStatusSub!: Subscription;
  userDataSub!: Subscription;

  userIsAuthenticated: boolean = false;
  isAuth: boolean = false;

  user!: User | null;

  constructor(private primengConfig: PrimeNGConfig,
    private categoriesService: CategoriesService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.authService.autoAuthUser();
    const id = this.authService.getLocalId();
    this.user = this.authService.getUserData();
    if (!!id && this.user === undefined) {
      this.authService.autoUserData(id).subscribe(results => {
        this.user = results;
        this.authService.autoAuthUser();
      })
    }

    this.userIsAuthenticated = this.authService.getIsAuth();

    this._getCategories();

    this.cartService.initCartLocalStorage();


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

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        console.log('getAuthStatusListener', authStatus)
        this.isAuth = authStatus;
        this._getCategories()
      }
    );

    this.isAuth = this.authService.getIsAuth();
    this.userDataSub = this.authService.getUserDataListener().subscribe(
      userData => {
        this.user = userData;
      }
    );
  }

  goToCart() {
    this.router.navigateByUrl('cart');
  }

  private _getCategories() {
    this.categories = {};
    this.categoriesService.getCategories().subscribe((results) => {
      results.forEach((cat: Category) => {
        const name = cat['name'];
        this.categories[name] = cat;
      });

      this._getMenuItems();
    });
  }

  private _getMenuItems() {
    this.items = [
      { label: 'Home', icon: 'icon product-icon', routerLink: ['/'] },
      { label: 'Flower', icon: 'icon product-icon', routerLink: [`/category/${this.categories['Flower'].id}`] },
      { label: 'Designer Flower', icon: 'icon designer-icon', routerLink: [`/category/${this.categories['Designer Flower'].id}`] },
      { label: 'Pre Rolls', icon: 'icon pre-roll-icon', routerLink: ['/category/' + this.categories['Pre Rolls'].id] },
      { label: 'Edibles', icon: 'icon edible-icon', routerLink: ['/category/' + this.categories['Edibles'].id] },
      { label: 'Concentrates', icon: 'icon concentrate-icon', routerLink: ['/category/' + this.categories['Concentrates'].id] },
      { label: 'Carts', icon: 'icon cartridge-icon', routerLink: ['/category/' + this.categories['Carts'].id] },
      { label: 'FAQ', icon: 'icon faq-icon', routerLink: ['/faq'] },
      //{ label: 'Contact', icon: 'icon contact-icon', routerLink: ['/contact'] }
    ];

    if (this.isAuth) {
      // remove login and register
      this.removeItem('Login')
      this.removeItem('Register')

      // Add Login and Register
      this.items.push({ label: 'Logout', icon: 'icon logout-icon', routerLink: ['/logout'] });
    }

    else {
      // remove logout
      this.removeItem('Logout')

      // Add Login and Register
      this.items.push({ label: 'Login', icon: 'icon login-icon', routerLink: ['/login'] });
      this.items.push({ label: 'Register', icon: 'icon register-icon', routerLink: ['/register'] });
    }
  }

  removeItem(targetLabel: string): void {
    let idx = 0;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].label === targetLabel) {
        idx = i;
      }
    }
    this.items.splice(idx, 1);
  }

  update() { }

  delete() { }

}
