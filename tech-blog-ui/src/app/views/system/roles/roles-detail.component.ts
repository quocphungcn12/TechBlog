import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  RoleDto,
} from 'src/app/api/admin-api.service.generated';
import { UtilityService } from 'src/app/shared/services/utility.service';

@Component({
  templateUrl: 'roles-detail.component.html',
})
export class RolesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscrise = new Subject<void>();

  // Default
  public form: FormGroup;
  public blockedPanelDetail: boolean = false;
  public saveBtnName: string;
  public btnDisabled: boolean = false;
  public closeBtnName: string;
  selectedEntity = {} as RoleDto;

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private utilService: UtilityService,
    private roleService: AdminApiRoleApiClient
  ) {}
  ngOnInit(): void {
    this.buildForm();
    if (!this.utilService.isEmpty(this.config?.data?.id)) {
      this.loadDetail(this.config.data.id);
      this.saveBtnName = 'Cập nhật';
      this.closeBtnName = 'Hủy';
    } else {
      this.saveBtnName = 'Thêm';
      this.closeBtnName = 'Đóng';
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscrise.next();
    this.ngUnsubscrise.complete();
  }

  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    name: [
      { type: 'required', message: 'Bạn phải nhập tên quyền' },
      { type: 'minlength', message: 'Bạn phải nhập ít nhất 3 kí tự' },
      { type: 'maxlength', message: 'Bạn không được nhập quá 255 kí tự' },
    ],
    displayName: [{ type: 'required', message: 'Bạn phải tên hiển thị' }],
  };

  buildForm() {
    this.form = this.fb.group({
      name: new FormControl(
        this.selectedEntity.name || null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(3),
        ])
      ),
      displayName: new FormControl(
        this.selectedEntity.displayName || null,
        Validators.required
      ),
    });
  }

  loadDetail(id: any) {
    this.toogleBlockUI(true);
    this.roleService
      .getRoleById(id)
      .pipe(takeUntil(this.ngUnsubscrise))
      .subscribe({
        next: (response: RoleDto) => {
          this.selectedEntity = response;
          this.buildForm();
        },
        error: (error) => console.log(error),
        complete: () => this.toogleBlockUI(false),
      });
  }

  saveChange() {
    this.toogleBlockUI(true);
    this.saveData();
  }

  private saveData() {
    if (this.utilService.isEmpty(this.config.data?.id)) {
      this.roleService
        .createRole(this.form.value)
        .pipe(takeUntil(this.ngUnsubscrise))
        .subscribe(() => {
          this.ref.close(this.form.value);
          this.toogleBlockUI(false);
        });
    } else {
      this.roleService
        .updateRole(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscrise))
        .subscribe(() => {
          this.toogleBlockUI(false);
          this.ref.close(this.form.value);
        });
    }
  }

  private toogleBlockUI(enabled: boolean) {
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
