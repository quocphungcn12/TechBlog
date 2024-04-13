import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiSeriesApiClient,
  SeriesDto,
  SeriesInListDto,
  SeriesInListDtoPagedResult,
} from 'src/app/api/admin-api.service.generated';
import { CommonConstants } from 'src/app/shared/constants/common.constants';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SeriesDetailComponent } from './series-detail.component';
import { MessageConstants } from 'src/app/shared/constants/messages.constants';
import { PageEvent } from 'src/app/shared/models/page-event.model';

@Component({
  templateUrl: 'series.component.html',
})
export class SeriesComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();
  public blockedPanel: boolean = false;
  //Default

  //Paging variables
  public totalCount: number;
  public pageSize: number = CommonConstants.pageSize;
  public pageIndex: number = CommonConstants.pageIndex;
  public keyword: string = '';
  //Business variables
  public selectedItems: SeriesInListDto[] = [];
  public items: SeriesInListDto[];

  constructor(
    private seriesApiClient: AdminApiSeriesApiClient,
    private dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubcribe.next();
    this.ngUnsubcribe.complete();
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(selectionId = null): void {
    this.toggleBlockUI(true);
    this.seriesApiClient
      .getSeriesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: (response: SeriesInListDtoPagedResult) => {
          this.items = response.result;
          this.totalCount = response.rowCount;
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  showPosts(): void {}

  showAddModal(): void {
    const ref = this.dialogService.open(SeriesDetailComponent, {
      header: 'Thêm mới series bài viết',
      width: '80%',
      position: 'top-right',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: SeriesDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  showEditModal(): void {
    const ref = this.dialogService.open(SeriesDetailComponent, {
      data: {
        id: this.selectedItems[0].id,
      },
      header: 'Cập nhật series bài viết',
      width: '80%',
      position: 'top-right',
    });
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent;
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy();
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy;
    ref.onClose.subscribe((data: SeriesDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData(data.id);
      }
    });
  }

  deleteItems(): void {}

  pageChanged(event: PageEvent) {
    console.log(event);
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
