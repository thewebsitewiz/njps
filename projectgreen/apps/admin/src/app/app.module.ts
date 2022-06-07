import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CategoriesService } from '@projectgreen/products';
import { JwtInterceptor, UsersModule } from '@projectgreen/users';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { HeaderComponent } from './shared/header/header.component';
import { ShellComponent } from './shared/shell/shell.component';

const UX_MODULE = [
  BadgeModule,
  ButtonModule,
  CalendarModule,
  CardModule,
  ColorPickerModule,
  ConfirmDialogModule,
  ContextMenuModule,
  DragDropModule,
  DialogModule,
  DropdownModule,
  EditorModule,
  FieldsetModule,
  InputMaskModule,
  InputNumberModule,
  InputSwitchModule,
  InputTextModule,
  InputTextareaModule,
  MenuModule,
  MultiSelectModule,
  OrderListModule,
  PaginatorModule,
  ProgressBarModule,
  SelectButtonModule,
  SliderModule,
  TableModule,
  TagModule,
  ToastModule,
  ToolbarModule
];

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
    DashboardComponent,
    CategoriesListComponent,
    CategoriesFormComponent,
    ProductsListComponent,
    ProductsFormComponent,
    InventoryListComponent,
    InventoryFormComponent,
    CheckinFormComponent,
    CheckinListComponent,
    UsersListComponent,
    UsersFormComponent,
    OrdersListComponent,
    OrdersDetailComponent,
    DeliveryListComponent,
    DeliveryFormComponent,
    HeaderComponent,
    FAQListComponent,
    FAQFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    FormsModule,
    ReactiveFormsModule,
    UsersModule,
    ...UX_MODULE
  ],
  providers: [
    CategoriesService,
    MessageService,
    ConfirmationService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
