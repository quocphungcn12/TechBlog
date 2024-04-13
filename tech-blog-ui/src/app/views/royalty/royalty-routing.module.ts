import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoyaltyMonthComponent } from './royalty-month/royalty-month.component';
import { AuthGuard } from './../../shared/auth.guard';
import { RoyaltyUserComponent } from './royalty-user/royalty-user.component';
import { TransactionComponent } from './transactions/transactions.component';
import { Royalty } from './../../shared/constants/permissions.constants';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'transactions',
    pathMatch: 'full',
  },
  {
    path: 'royalty-month',
    component: RoyaltyMonthComponent,
    data: {
      title: 'Thống kê tháng',
      requiredPolicy: Royalty.VIEW,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'royalty-user',
    component: RoyaltyUserComponent,
    data: {
      title: 'Thống kê tác giả',
      requiredPolicy: Royalty.VIEW,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions',
    component: TransactionComponent,
    data: {
      title: 'Giao dịch',
      requiredPolicy: Royalty.VIEW,
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoyaltyRoutingModule {}
