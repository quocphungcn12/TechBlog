import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { DashboardPermissions } from 'src/app/shared/constants/permissions.constants';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      title: 'Trang chủ',
      requiredPolicy: DashboardPermissions.VIEW,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
