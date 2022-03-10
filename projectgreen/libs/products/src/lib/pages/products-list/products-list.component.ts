import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../../models/category';
import { Categories } from '../../models/category';
import { Product } from '../../models/product';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { environment } from '@env/environment';

@Component({
  selector: 'products-list',
  templateUrl: './products-list.component.html',
  styles: []
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  categoryId!: string;
  categories!: { [key: string]: Category };
  categoryName!: string | undefined;

  constructor(
    private prodService: ProductsService,
    private catService: CategoriesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      this.categoryId = params['categoryid'];
      this.categoryId ? this._getProducts([this.categoryId]) : this._getProducts();
      this._getCategory(this.categoryId);
    });

  }

  private _getProducts(categoriesFilter?: string[]) {
    this.prodService.getProducts(categoriesFilter).subscribe((results) => {
      this.products = [];
      results.forEach((product: any) => {
        product.image = `${environment.imageUrl}${product.image}`;
        this.products.push(product);
      })
    });
  }

  private _getCategory(categoryId: string) {
    this.catService.getCategories().subscribe((results) => {
      results.forEach((cat: Category) => {
        this.categories[cat.id] = cat;
      });
      this.categoryName = this.categories[this.categoryId].name;
    });
  }

  /* categoryFilter() {
    const selectedCategories = this.categories
      .filter((category) => category.checked)
      .map((category) => category.id ?? '');

    this._getProducts(selectedCategories);
  } */
}
