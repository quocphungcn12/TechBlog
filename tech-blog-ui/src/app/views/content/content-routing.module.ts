import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostComponent } from './posts/post.component';
import {
  PostPermissions,
  Series,
} from 'src/app/shared/constants/permissions.constants';
import { AuthGuard } from 'src/app/shared/auth.guard';
import { PostCategoryComponent } from './post-categories/post-category.component';
import { SeriesComponent } from './series/series.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'posts',
    component: PostComponent,
    data: {
      title: 'Bài viết',
      requiredPolicy: PostPermissions.VIEW,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'post-categories',
    component: PostCategoryComponent,
    data: {
      title: 'Danh mục',
      requiredPolicy: PostPermissions.VIEW,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'series',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    data: {
      requiredPolicy: Series.VIEW,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentRoutingModule {}
