import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiPostCategoryApiClient,
  PostCategoryDto,
  PostCategoryDtoPagedResult,
} from 'src/app/api/admin-api.service.generated';
import { CommonConstants } from 'src/app/shared/constants/common.constants';
import { MessageConstants } from 'src/app/shared/constants/messages.constants';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PostCategoryDetailComponent } from './post-category-detail.component';
import { ConfirmationService } from 'primeng/api';
import { PageEvent } from 'src/app/shared/models/page-event.model';

@Component({
  templateUrl: 'post-category.component.html',
})
export class PostCategoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;

  //Paging variables
  public totalCount: number;
  public pageSize: number = CommonConstants.pageSize;
  public pageIndex: number = CommonConstants.pageIndex;

  //Business variables
  public selectedItems: PostCategoryDto[] = [];
  public items: PostCategoryDto[];
  public keyword: string;

  constructor(
    private dialogService: DialogService,
    private postCategoryService: AdminApiPostCategoryApiClient,
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

  loadData(): void {
    this.toggleBlockUI(true);

    this.postCategoryService
      .getPostCategoriesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostCategoryDtoPagedResult) => {
          this.items = response.result;
          this.totalCount = response.rowCount;
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  showAddModal(): void {
    const ref = this.dialogService.open(PostCategoryDetailComponent, {
      header: 'Thêm mới loạt bài viết',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: PostCategoryDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  showEditModal(): void {
    if (this.selectedItems.length === 0) {
      this.alertService.showSuccess(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    const ref = this.dialogService.open(PostCategoryDetailComponent, {
      data: {
        id: this.selectedItems[0].id,
      },
      header: 'Cập nhật loại bài viết',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((result: boolean) => {
      if (result) {
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
    this.selectedItems.forEach((e) => ids.push(e.id));
    this.confirmationService.confirm({
      message: MessageConstants.CONFIRM_DELETE_MSG,
      accept: () => {
        this.deleteItemsConfirm(ids);
      },
    });
  }

  deleteItemsConfirm(ids: string[]) {
    this.toggleBlockUI(true);

    this.postCategoryService.deletePostCategory(ids).subscribe({
      next: () => {
        this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      },
      complete: () => this.toggleBlockUI(false),
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
