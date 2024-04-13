import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { AdminApiPostApiClient } from 'src/app/api/admin-api.service.generated';

@Component({
  templateUrl: 'post-return-reason.component.html',
})
export class PostReturnReasonComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();

  //Default
  public blockedPanelDetail: boolean = false;
  public btnDisabled: boolean = false;
  public form: FormGroup;

  // Validation
  validationMessages = {
    reason: [{ type: 'required', message: 'Bạn phải nhập lý do' }],
  };

  constructor(
    private fb: FormBuilder,
    private postApiClient: AdminApiPostApiClient,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubcribe.next();
    this.ngUnsubcribe.complete();
  }
  ngOnInit(): void {
    this.buildForm();
  }

  saveChange(): void {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData(): void {
    this.toggleBlockUI(true);
    this.postApiClient
      .returnBack(this.config.data.id, this.form.value)
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: () => {
          this.ref.close(this.form.value);
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

  buildForm(): void {
    this.form = this.fb.group({
      reason: new FormControl(null, Validators.required),
    });
  }
}
