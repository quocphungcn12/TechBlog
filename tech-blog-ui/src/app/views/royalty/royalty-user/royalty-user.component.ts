import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoyaltyApiClient,
  RoyaltyReportByUserDto,
} from 'src/app/api/admin-api.service.generated';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  templateUrl: 'royalty-user.component.html',
})
export class RoyaltyUserComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();
  // Default
  public blockedPanel: boolean = false;
  public items: RoyaltyReportByUserDto[] = [];
  public toMonth: number = 12;
  public fromMonth: number = 1;
  public fromYear: number = new Date().getFullYear();
  public toYear: number = new Date().getFullYear();
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
    this.royaltyApi
      .getRoyaltyReportByUser(
        this.userName,
        this.fromMonth,
        this.fromYear,
        this.toMonth,
        this.toYear
      )
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: (response: RoyaltyReportByUserDto[]) => {
          this.items = response;
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  loadData() {
    this.toggleBlockUI(true);
  }

  payForUser(userId) {}

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
