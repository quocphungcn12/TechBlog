import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiUserApiClient,
  UserDto,
  UserDtoPagedResult,
} from 'src/app/api/admin-api.service.generated';
import { CommonConstants } from 'src/app/shared/constants/common.constants';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SetPasswordComponent } from './set-password.component';
import { MessageConstants } from 'src/app/shared/constants/messages.constants';
import { UserDetailComponent } from './user-detail.component';
import { RoleAssignComponent } from './role-assign.component';
import { ChangeEmailComponent } from './change-email.component';
import { PageEvent } from 'src/app/shared/models/page-event.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit, OnDestroy {
  // System variables
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;

  //Paging variables
  public totalCount: number;
  public pageSize: number = CommonConstants.pageSize;
  public pageIndex: number = CommonConstants.pageIndex;

  //Business variables
  public selectedItems: UserDto[] = [];
  public items: UserDto[];
  public keyword: string;

  constructor(
    private userManager: AdminApiUserApiClient,
    private dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(selectionId = null): void {
    this.toggleBlockUI(true);
    this.userManager
      .getAllUserPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserDtoPagedResult) => {
          this.items = response.result;
          this.totalCount = response.rowCount;
          if (selectionId != null && this.items.length > 0) {
            this.selectedItems = this.items.filter((x) => x.id === selectionId);
          }
        },
        error: () => {},
        complete: () => this.toggleBlockUI(false),
      });
  }
  pageChanged(event: PageEvent): void {
    console.log(event);
    this.pageIndex = event.page + 1;
    this.pageSize = event.rows;
    this.loadData();
  }

  showAddModal(): void {
    const ref = this.dialogService.open(UserDetailComponent, {
      header: 'Thêm mới người dùng',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((response: UserDto) => {
      if (response) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }
  showEditModal() {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    const id = this.selectedItems[0].id;
    const ref = this.dialogService.open(UserDetailComponent, {
      data: {
        id: id,
      },
      header: 'Cập nhật người dùng',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: UserDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData(data.id);
      }
    });
  }

  deleteItems() {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    let ids = [];
    this.selectedItems.forEach((element) => {
      ids.push(element.id);
    });
    this.confirmationService.confirm({
      message: MessageConstants.CONFIRM_DELETE_MSG,
      accept: () => {
        this.deleteItemsConfirm(ids);
      },
    });
  }

  assignRole(id: any): void {
    const ref = this.dialogService.open(RoleAssignComponent, {
      data: {
        id: id,
      },
      header: 'Gán quyền',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((result: boolean) => {
      console.log(result);
      if (result) {
        this.alertService.showSuccess(MessageConstants.ROLE_ASSIGN_SUCCESS_MSG);
        this.loadData();
      }
    });
  }
  changeEmail(id: string): void {
    const ref = this.dialogService.open(ChangeEmailComponent, {
      data: {
        id: id,
      },
      header: 'Đặt lại Email',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          MessageConstants.CHANGE_EMAIL_SUCCCESS_MSG
        );
        this.selectedItems = [];
        this.loadData();
      }
    });
  }
  setPassword(id: string): void {
    const ref = this.dialogService.open(SetPasswordComponent, {
      data: {
        id: id,
      },
      header: 'Đặt lại mật khẩu',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          MessageConstants.CHANGE_PASSWORD_SUCCCESS_MSG
        );
        this.selectedItems = [];
        this.loadData();
      }
    });
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
  private deleteItemsConfirm(ids: string[]) {
    this.toggleBlockUI(true);
    this.userManager.deleteUsers(ids).subscribe({
      next: () => {
        this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      },
      complete: () => this.toggleBlockUI(false),
    });
  }
}
