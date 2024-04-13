import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  PermissionDto,
  RoleClaimsDto,
} from 'src/app/api/admin-api.service.generated';

@Component({
  templateUrl: 'permission-grant.component.html',
})
export class PermissionGrantComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public saveBtnName: string;
  public closeBtnName: string;
  public btnDisabled = false;
  public form: FormGroup;
  public permissions: RoleClaimsDto[] = [];
  public selectedPermissions: RoleClaimsDto[] = [];

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private roleService: AdminApiRoleApiClient,
    private config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.buildForm();
    this.loadDetail(this.config.data.id);
    this.saveBtnName = 'Cập nhật';
    this.closeBtnName = 'Hủy';
  }

  loadDetail(roleId: string): void {
    this.toggleBlockUI(true);
    this.roleService
      .getAllRolePermissions(roleId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PermissionDto) => {
          this.permissions = response.roleClaims;
          this.buildForm();
        },
        error: () => {},
        complete: () => this.toggleBlockUI(false),
      });
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData(): void {
    let roleClaims: RoleClaimsDto[] = [];
    for (const permission of this.permissions) {
      let isGranted =
        this.selectedPermissions.filter((x) => x.value === permission.value)
          .length > 0;

      roleClaims.push(
        new RoleClaimsDto({
          type: permission.type,
          displayName: permission.displayName,
          selected: isGranted,
          value: permission.value,
        })
      );
    }
    const updateValues = new PermissionDto({
      roleId: this.config.data.id,
      roleClaims: roleClaims,
    });
    this.roleService
      .savePermission(updateValues)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.toggleBlockUI(false);
        this.ref.close(this.form.value);
      });
  }

  buildForm() {
    this.form = this.fb.group({});
    // fill value
    for (const permission of this.permissions) {
      if (permission.selected) {
        this.selectedPermissions.push(
          new RoleClaimsDto({
            selected: true,
            displayName: permission.displayName,
            type: permission.type,
            value: permission.value,
          })
        );
      }
    }
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
