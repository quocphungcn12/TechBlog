import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  AdminApiUserApiClient,
  RoleDto,
  UserDto,
} from 'src/app/api/admin-api.service.generated';

@Component({
  templateUrl: 'role-assign.component.html',
})
export class RoleAssignComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public saveBtnName: string;
  public closeBtnName: string;
  public btnDisabled = false;
  public seletedRoles: string[] = [];
  public availableRoles: string[] = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private roleService: AdminApiRoleApiClient,
    private userService: AdminApiUserApiClient
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    const roles = this.roleService.getAllRoles();

    forkJoin({
      roles,
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          let roles = response.roles as RoleDto[];
          roles.forEach((e) => this.availableRoles.push(e.name));
          console.log(this.availableRoles);

          this.loadDetail(this.config.data?.id);
        },
        complete: () => this.toggleBlockUI(false),
      });
    this.saveBtnName = 'Cập nhật';
    this.closeBtnName = 'Hủy';
  }

  saveChange(): void {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData(): void {
    this.userService
      .assignRoleToUser(this.config.data?.id, this.seletedRoles)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.toggleBlockUI(false);
        this.ref.close();
      });
  }

  loadRoles(): void {
    this.toggleBlockUI(true);
    this.roleService
      .getAllRoles()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleDto[]) => {
          response.forEach((element) => {
            this.availableRoles.push(element.name);
          });
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  loadDetail(id: string): void {
    this.toggleBlockUI(true);
    this.userService
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserDto) => {
          this.seletedRoles = response.roles;
          this.availableRoles = this.availableRoles.filter(
            (x) => !this.seletedRoles.includes(x)
          );
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled) {
      this.btnDisabled = true;
      this.blockedPanelDetail = true;
    } else {
      setTimeout(() => {
        this.btnDisabled = false;
        this.blockedPanelDetail = false;
      }, 1000);
    }
  }
}
