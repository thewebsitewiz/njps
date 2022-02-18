import { Component } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';

import { CategoriesService, Category } from '@projectgreen/products';
import { Categories } from '@projectgreen/products';

@Component({
  selector: 'ngshop-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  items!: MenuItem[];
  cartCount: number = 8;


  categories: Categories = {};
  categoryName!: string | undefined;


  constructor(private primengConfig: PrimeNGConfig,
    private categoriesService: CategoriesService) { }

  ngOnInit() {
    this.primengConfig.ripple = true;

    this._getCategories()



  }

  private _getCategories() {
    this.categoriesService.getCategories().subscribe((results) => {
      results.forEach((cat: Category) => {
        this.categories[cat.name] = cat;
      });

      this.items = [
        { label: 'Home', icon: 'icon product-icon', routerLink: ['/'] },
        { label: 'Flower', icon: 'icon product-icon', routerLink: ['/category/' + this.categories['Flower'].id] },
        { label: 'Designer Flower', icon: 'icon product-icon', routerLink: ['/category/' + this.categories['Designer Flower'].id] },
        { label: 'Pre Rolls', icon: 'icon product-icon', routerLink: ['/category/' + this.categories['Pre Rolls'].id] },
        { label: 'Edibles', icon: 'icon product-icon', routerLink: ['/category/' + this.categories['Edibles'].id] },
        { label: 'Concentrates', icon: 'icon specials-icon', routerLink: ['/category/' + this.categories['Concentrates'].id] },
        { label: 'Carts', icon: 'icon specials-icon', routerLink: ['/category/' + this.categories['Carts'].id] },
        { label: 'FAQ', icon: 'icon faq-icon', routerLink: ['/faq'] },
        { label: 'Contact', icon: 'icon contact-icon', routerLink: ['/contact'] },
        { label: 'Login', icon: 'icon contact-icon', routerLink: ['/login'] },
        { label: 'Register', icon: 'icon contact-icon', routerLink: ['/register'] },
      ];
    });
  }




  update() { }

  delete() { }

}
