import { Component, OnInit } from '@angular/core';

import { navItems } from './_nav';
import { TokenStorageService } from 'src/app/shared/services/token-storage.service';
import { Router } from '@angular/router';
import { UrlConstants } from 'src/app/shared/constants/url.constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  public navItems = [];

  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) {}
  ngOnInit(): void {
    const user = this.tokenService.getUser();
    if (user == null) this.router.navigate([UrlConstants.LOGIN]);
    const permissions = JSON.parse(user.permissions);
    if (permissions.length === 0)
      this.router.navigate([UrlConstants.ACCESS_DENIED]);
    for (const element of navItems) {
      if (
        element.attributes &&
        permissions.filter((x: any) => x === element.attributes['policyName'])
          .length === 0
      ) {
        element.class = 'hidden';
      }
      for (
        let childIndex = 0;
        childIndex < element.children?.length;
        childIndex++
      ) {
        if (
          element.children[childIndex].attributes &&
          permissions.filter(
            (x: any) =>
              x == element.children[childIndex].attributes['policyName']
          ).length == 0
        ) {
          element.children[childIndex].class = 'hidden';
        }
      }
      this.navItems.push(element);
    }
  }
}
