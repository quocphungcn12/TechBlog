import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonConstants } from 'src/app/shared/constants/common.constants';
import { PageEvent } from 'src/app/shared/models/page-event.model';
import {
  AdminApiRoyaltyApiClient,
  TransactionDto,
  TransactionDtoPagedResult,
} from 'src/app/api/admin-api.service.generated';
import { Subject, takeUntil } from 'rxjs';

@Component({
  templateUrl: 'transactions.component.html',
})
export class TransactionComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();
  // Default
  public blockedPanel: boolean = false;
  public items: TransactionDto[] = [];
  public fromYear: number = new Date().getFullYear();
  public toYear: number = new Date().getFullYear();
  public fromMonth: number = 1;
  public toMonth: number = 12;
  public userName: string = '';

  // paging
  public totalCount: number;
  public pageSize: number = CommonConstants.pageSize;
  public pageIndex: number = CommonConstants.pageIndex;

  constructor(private royaltyApiClient: AdminApiRoyaltyApiClient) {}

  ngOnDestroy(): void {
    this.ngUnsubcribe.next();
    this.ngUnsubcribe.complete();
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.toggleBlockUI(true);
    this.royaltyApiClient
      .getTransactionHistory(
        this.userName,
        this.fromMonth,
        this.fromYear,
        this.toMonth,
        this.toYear,
        this.pageIndex,
        this.pageSize
      )
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: (response: TransactionDtoPagedResult) => {
          this.items = response.result;
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.page + 1;
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
