import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './users/user.component';
import { RoleComponent } from './roles/role.component';
import {
  RolePermissions,
  UserPermissions,
} from 'src/app/shared/constants/permissions.constants';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    component: UserComponent,
    data: {
      title: 'Người dùng',
      requiredPolicy: UserPermissions.VIEW,
    },
  },
  {
    path: 'roles',
    component: RoleComponent,
    data: {
      title: 'Quyền',
      requiredPolicy: RolePermissions.VIEW,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemRoutingModule {}
