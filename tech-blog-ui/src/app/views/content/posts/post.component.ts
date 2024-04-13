import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  PostCategoryDto,
  PostDto,
  PostInListDto,
  PostInListDtoPagedResult,
} from 'src/app/api/admin-api.service.generated';
import { CommonConstants } from 'src/app/shared/constants/common.constants';
import { PostDetailComponent } from './post-detail.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MessageConstants } from 'src/app/shared/constants/messages.constants';
import { ConfirmationService } from 'primeng/api';
import { PostSeriesComponent } from './post-series.component';
import { PageEvent } from 'src/app/shared/models/page-event.model';
import { PostReturnReasonComponent } from './post-return-reason.component';
import { PostActivityLogsComponent } from './post-activity-logs.component';

interface PostCategoryClient {
  value: string;
  label: string;
}

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
})
export class PostComponent implements OnInit, OnDestroy {
  //System variables
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;

  //Paging variables
  public totalCount: number;
  public pageSize: number = CommonConstants.pageSize;
  public pageIndex: number = CommonConstants.pageIndex;
  public keyword: string = '';

  //Business variables
  public selectedItems: PostInListDto[] = [];
  public items: PostInListDto[];
  public categoryId?: string = null;
  public postCategories: PostCategoryClient[] = [];
  public postCate: PostCategoryClient[] = [];

  constructor(
    private postApiClient: AdminApiPostApiClient,
    private dialogService: DialogService,
    private postCategoryApiClient: AdminApiPostCategoryApiClient,
    private alertService: AlertService,
    private conformationService: ConfirmationService
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.loadPostCategories();
    this.loadData();
  }

  showAddModal(): void {
    const ref = this.dialogService.open(PostDetailComponent, {
      header: 'Thêm mới bài viết',
      width: '80%',
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

    const ref = this.dialogService.open(PostDetailComponent, {
      data: {
        id: this.selectedItems[0].id,
      },
      header: 'Cập nhật bài viết',
      width: '80%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData(data.id);
      }
    });
  }

  loadData(selectionId = null): void {
    this.toggleBlockUI(true);
    this.postApiClient
      .getPostPaging(
        this.keyword,
        this.categoryId,
        this.pageIndex,
        this.pageSize
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostInListDtoPagedResult) => {
          this.items = response.result;
          this.totalCount = response.rowCount;
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  loadPostCategories() {
    this.postCategoryApiClient
      .getAllPostCategory()
      .subscribe((response: PostCategoryDto[]) => {
        response.forEach((element) => {
          this.postCategories.push({
            value: element.id,
            label: element.name,
          });
        });
        this.postCate = this.postCategories;
      });
  }

  deleteItems(): void {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    let ids = [];
    this.selectedItems.forEach((element) => {
      ids.push(element.id);
    });
    this.conformationService.confirm({
      message: MessageConstants.CONFIRM_DELETE_MSG,
      accept: () => {
        this.deleteItemsConfirm(ids);
      },
    });
  }

  deleteItemsConfirm(ids: string[]) {
    this.toggleBlockUI(true);
    this.postApiClient.deletePosts(ids).subscribe({
      next: () => {
        this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      },
      error: () => {},
      complete: () => this.toggleBlockUI(false),
    });
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.loadData();
  }

  showLogs(id: string): void {
    const ref = this.dialogService.open(PostActivityLogsComponent, {
      data: {
        id: id,
      },
      header: 'Xem lịch sử',
      width: '70%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData(data.id);
      }
    });
  }

  reject(id: string): void {
    const ref = this.dialogService.open(PostReturnReasonComponent, {
      data: {
        id: id,
      },
      header: 'Trả lại bài',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData(data.id);
      }
    });
  }

  sendToApprove(id: string): void {
    this.toggleBlockUI(true);
    this.postApiClient
      .sendToApprove(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
          this.selectedItems = [];
          this.loadData();
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  approve(id: string): void {
    this.toggleBlockUI(true);
    this.postApiClient
      .approvePost(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
          this.loadData();
          this.selectedItems = [];
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  addToSeries(id: string): void {
    const ref = this.dialogService.open(PostSeriesComponent, {
      data: {
        id: id,
      },
      header: 'Thêm vào loạt bài',
      width: '60%',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData(data.id);
      }
    });
  }

  private toggleBlockUI(enabled: boolean): void {
    if (enabled) {
      this.blockedPanel = true;
    } else {
      setTimeout(() => {
        this.blockedPanel = false;
      }, 1000);
    }
  }
}
