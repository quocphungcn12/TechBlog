import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoyaltyApiClient,
  RoyaltyReportByMonthDto,
} from 'src/app/api/admin-api.service.generated';
import { MessageConstants } from 'src/app/shared/constants/messages.constants';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  templateUrl: 'royalty-month.component.html',
})
export class RoyaltyMonthComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();

  // Default
  public blockedPanel: boolean = false;
  public items: RoyaltyReportByMonthDto[] = [];
  public fromYear: number = new Date().getFullYear();
  public toYear: number = new Date().getFullYear();
  public fromMonth: number = 1;
  public toMonth: number = 12;
  public userName: string = '';

  constructor(
    private royaltyApi: AdminApiRoyaltyApiClient,
    dialogService: DialogService,
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

  loadData() {
    this.toggleBlockUI(true);
    this.royaltyApi
      .getRoyaltyReportByMonth(
        this.userName,
        this.fromMonth,
        this.fromYear,
        this.toMonth,
        this.toYear
      )
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: (response: RoyaltyReportByMonthDto[]) => {
          this.items = response;
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  payForUser(userId: string) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn thanh toán?',
      accept: () => {
        this.payConfirm(userId);
      },
    });
  }

  payConfirm(id: string) {
    this.toggleBlockUI(true);

    this.royaltyApi.payRoyalty(id).subscribe({
      next: () => {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.loadData();
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
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
}
