import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerComponent } from './components/banner/banner.component';
import { ButtonModule } from 'primeng/button';
import { GalleryComponent } from './components/gallery/gallery.component';
import { EngagementComponent } from './components/engagement/engagement.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    InputTextModule
  ],
  declarations: [
    BannerComponent,
    GalleryComponent,
    EngagementComponent,
    SignupComponent,
    LoginComponent
  ],
  exports: [
    BannerComponent,
    GalleryComponent,
    EngagementComponent,
    SignupComponent,
    LoginComponent
  ]
})
export class UiModule { }
