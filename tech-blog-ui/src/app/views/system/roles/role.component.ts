import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  RoleDto,
  RoleDtoPagedResult,
} from 'src/app/api/admin-api.service.generated';
import { CommonConstants } from 'src/app/shared/constants/common.constants';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { RolesDetailComponent } from './roles-detail.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MessageConstants } from 'src/app/shared/constants/messages.constants';
import { ConfirmationService } from 'primeng/api';
import { PermissionGrantComponent } from './permission-grant.component';
import { PageEvent } from 'src/app/shared/models/page-event.model';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
})
export class RoleComponent implements OnInit, OnDestroy {
  //System variables
  public blockedPanel: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  //Paging variables
  public pageIndex: number = CommonConstants.pageIndex;
  public pageSize: number = CommonConstants.pageSize;
  public totalCount: number;

  //Business variables
  public selectedItems: RoleDto[] = [];
  public items: RoleDto[];
  public keyword: string = '';

  constructor(
    private roleService: AdminApiRoleApiClient,
    private dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadData() {
    this.toggleBlockUI(true);

    this.roleService
      .getRolesAllPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleDtoPagedResult) => {
          this.items = response.result;
          this.totalCount = response.rowCount;
        },
        error: (e) => {
          console.log(e);
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  showAddModal(): void {
    const ref = this.dialogService.open(RolesDetailComponent, {
      header: 'Thêm mới quyền',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: RoleDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  showEditModal(): void {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    const id = this.selectedItems[0].id;
    const ref = this.dialogService.open(RolesDetailComponent, {
      data: {
        id: id,
      },
      header: 'Cập nhật quyền',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: RoleDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  deleteItems(): void {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    let ids = [];
    this.selectedItems.forEach((element: RoleDto) => {
      ids.push(element.id);
    });

    this.confirmationService.confirm({
      message: MessageConstants.CONFIRM_DELETE_MSG,
      accept: () => {
        this.deleteItemConfirm(ids);
      },
    });
  }

  deleteItemConfirm(ids: any[]): void {
    this.toggleBlockUI(true);

    this.roleService
      .deleteRoles(ids)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
          this.loadData();
          this.selectedItems = [];
        },
        error: () => {},
        complete: () => this.toggleBlockUI(false),
      });
  }

  showPermissionModal(id: string, name: string): void {
    const ref = this.dialogService.open(PermissionGrantComponent, {
      data: {
        id: id,
      },
      header: name,
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: RoleDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.loadData();
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled) {
      this.blockedPanel = true;
    } else {
      setTimeout(() => {
        this.blockedPanel = false;
      }, 1000);
    }
  }
}
