import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { NgScrollbarModule } from 'ngx-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import {
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
} from './containers';
import {
  AvatarModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,
  SharedModule,
  SidebarModule,
  TabsModule,
  UtilitiesModule,
} from '@coreui/angular';

import { IconModule, IconSetService } from '@coreui/icons-angular';
import {
  ADMIN_API_BASE_URL,
  AdminApiAuthApiClient,
  AdminApiTestApiClient,
  AdminApiTokenApiClient,
  AdminApiRoleApiClient,
  AdminApiUserApiClient,
  AdminApiPostCategoryApiClient,
  AdminApiPostApiClient,
  AdminApiSeriesApiClient,
  AdminApiRoyaltyApiClient,
} from './api/admin-api.service.generated';
import { environment } from './../environments/environment';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AlertService } from './shared/services/alert.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenStorageService } from './shared/services/token-storage.service';
import { AuthGuard } from './shared/auth.guard';
import { GlobalHttpInterceptorService } from 'src/app/shared/interceptors/error-handler.interceptor';
import { TokenInterceptor } from 'src/app/shared/interceptors/token.interceptor';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { UtilityService } from './shared/services/utility.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UploadService } from '../app/shared/services/upload.service';

const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
];

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SidebarModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    CardModule,
    NgScrollbarModule,
    ToastModule,
    HttpClientModule,
    ConfirmDialogModule,
    DynamicDialogModule,
  ],
  providers: [
    { provide: ADMIN_API_BASE_URL, useValue: environment.API_URL },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalHttpInterceptorService,
      multi: true,
    },
    IconSetService,
    Title,
    MessageService,
    AlertService,
    AdminApiAuthApiClient,
    TokenStorageService,
    AuthGuard,
    AdminApiTokenApiClient,
    AdminApiTestApiClient,
    AdminApiRoleApiClient,
    DialogService,
    UtilityService,
    ConfirmationService,
    AdminApiUserApiClient,
    AdminApiPostCategoryApiClient,
    AdminApiPostApiClient,
    UploadService,
    AdminApiSeriesApiClient,
    AdminApiRoyaltyApiClient,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
