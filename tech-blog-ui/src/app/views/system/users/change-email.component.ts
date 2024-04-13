import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiUserApiClient,
  UserDto,
} from 'src/app/api/admin-api.service.generated';

@Component({
  templateUrl: 'change-email.component.html',
})
export class ChangeEmailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public saveBtnName: string;
  public btnDisabled = false;
  public form: FormGroup;
  public email: string;
  public closeBtnName: string;

  constructor(
    private fb: FormBuilder,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private userService: AdminApiUserApiClient
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.buildForm();
    this.loadDetail(this.config.data?.id);
    this.saveBtnName = 'Cập nhật';
    this.closeBtnName = 'Hủy';
  }

  loadDetail(id: string): void {
    this.toggleBlockUI(true);
    this.userService
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserDto) => {
          this.email = response.email;
          this.buildForm();
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  buildForm() {
    this.form = this.fb.group({
      email: new FormControl(
        this.email || null,
        Validators.compose([Validators.required, Validators.email])
      ),
    });
  }
  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData(): void {
    this.userService
      .changeEmail(this.config.data?.id, this.form.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.toggleBlockUI(false);
        this.ref.close(this.form.value);
      });
  }
  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    email: [
      { type: 'required', message: 'Bạn phải nhập email' },
      { type: 'email', message: 'Email không đúng định dạng' },
    ],
  };
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
