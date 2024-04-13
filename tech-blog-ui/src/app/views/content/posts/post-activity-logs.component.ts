import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiPostApiClient,
  PostActivityLogDto,
} from 'src/app/api/admin-api.service.generated';

@Component({
  templateUrl: 'post-activity-logs.component.html',
})
export class PostActivityLogsComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();

  //Default
  public blockedPanelDetail: boolean = false;
  public btnDisabled: boolean = false;
  public items: PostActivityLogDto[] = [];

  constructor(
    private postApiClient: AdminApiPostApiClient,
    private config: DynamicDialogConfig
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubcribe.next();
    this.ngUnsubcribe.complete();
  }
  ngOnInit(): void {
    // load data to form
    this.toggleBlockUI(true);
    this.postApiClient
      .getActivityLogs(this.config.data.id)
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: (response: PostActivityLogDto[]) => {
          this.items = response;
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
