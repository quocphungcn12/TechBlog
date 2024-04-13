import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RoyaltyRoutingModule } from './royalty-routing.module';
import { IconModule } from '@coreui/icons-angular';
import { PanelModule } from 'primeng/panel';
import { TransactionComponent } from './transactions/transactions.component';
import { RoyaltyUserComponent } from './royalty-user/royalty-user.component';
import { RoyaltyMonthComponent } from './royalty-month/royalty-month.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { PaginatorModule } from 'primeng/paginator';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TechBlogModule } from 'src/app/shared/modules/techblog-shared.module';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { ImageModule } from 'primeng/image';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChartjsModule } from '@coreui/angular-chartjs';

@NgModule({
  imports: [
    CommonModule,
    IconModule,
    ReactiveFormsModule,
    RoyaltyRoutingModule,
    ProgressSpinnerModule,
    TechBlogModule,
    BlockUIModule,
    PaginatorModule,
    BadgeModule,
    InputNumberModule,
    PanelModule,
    InputTextModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    KeyFilterModule,
    InputTextareaModule,
    DropdownModule,
    EditorModule,
    ImageModule,
    AutoCompleteModule,
    ChartjsModule,
  ],
  declarations: [
    TransactionComponent,
    RoyaltyMonthComponent,
    RoyaltyUserComponent,
  ],
})
export class RoyaltyModule {}
