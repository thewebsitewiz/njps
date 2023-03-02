import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@projectgreen/users';

import {
    CategoriesFormComponent
} from './pages/categories/categories-form/categories-form.component';
import {
    CategoriesListComponent
} from './pages/categories/categories-list/categories-list.component';
import { CheckinFormComponent } from './pages/checkin/checkin-form/checkin-form.component';
import { CheckinListComponent } from './pages/checkin/checkin-list/checkin-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DeliveryFormComponent } from './pages/delivery/delivery-form/delivery-form.component';
import { DeliveryListComponent } from './pages/delivery/delivery-list/delivery-list.component';
import { FAQFormComponent } from './pages/faq/faq-form/faq-form.component';
import { FAQListComponent } from './pages/faq/faq-list/faq-list.component';
import { InventoryFormComponent } from './pages/inventory/inventory-form/inventory-form.component';
import { InventoryListComponent } from './pages/inventory/inventory-list/inventory-list.component';
import { OrdersDetailComponent } from './pages/orders/orders-detail/orders-detail.component';
import { OrdersListComponent } from './pages/orders/orders-list/orders-list.component';
import { ProductsFormComponent } from './pages/products/products-form/products-form.component';
import { ProductsListComponent } from './pages/products/products-list/products-list.component';
import { UsersFormComponent } from './pages/users/users-form/users-form.component';
import { UsersListComponent } from './pages/users/users-list/users-list.component';
import { ShellComponent } from './shared/shell/shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'categories',
        component: CategoriesListComponent
      },
      {
        path: 'categories/form',
        component: CategoriesFormComponent
      },
      {
        path: 'categories/form/:id',
        component: CategoriesFormComponent
      },
      {
        path: 'products',
        component: ProductsListComponent
      },
      {
        path: 'products/form',
        component: ProductsFormComponent
      },
      {
        path: 'products/form/:id',
        component: ProductsFormComponent
      },
      {
        path: 'delivery',
        component: DeliveryListComponent
      },
      {
        path: 'delivery/form',
        component: DeliveryFormComponent
      },
      {
        path: 'delivery/form/:id',
        component: DeliveryFormComponent
      },
      {
        path: 'inventory',
        component: InventoryListComponent
      },
      {
        path: 'inventory/form',
        component: InventoryFormComponent
      },
      {
        path: 'inventory/form/:id',
        component: InventoryFormComponent
      },
      {
        path: 'checkin',
        component: CheckinListComponent
      },
      {
        path: 'checkin/form',
        component: CheckinFormComponent
      },
      {
        path: 'checkin/form/:id',
        component: CheckinFormComponent
      },
      {
        path: 'users',
        component: UsersListComponent
      },
      {
        path: 'users/form',
        component: UsersFormComponent
      },
      {
        path: 'users/form/:id',
        component: UsersFormComponent
      },
      {
        path: 'orders',
        component: OrdersListComponent
      },
      {
        path: 'orders/:id',
        component: OrdersDetailComponent
      },
      {
        path: 'faq',
        component: FAQListComponent
      },
      {
        path: 'faq/form',
        component: FAQFormComponent
      },
      {
        path: 'faq/form/:id',
        component: FAQFormComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled', enableTracing: false })],
  exports: [RouterModule],
  declarations: [],
  providers: []
})
export class AppRoutingModule { }
