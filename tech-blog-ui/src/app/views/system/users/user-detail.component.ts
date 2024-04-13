import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  AdminApiUserApiClient,
  RoleDto,
  UserDto,
} from 'src/app/api/admin-api.service.generated';
import { UtilityService } from 'src/app/shared/services/utility.service';

@Component({
  templateUrl: 'user-detail.component.html',
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public btnDisabled = false;
  public saveBtnName: string;
  public avatarImage;
  selectEntity = {} as UserDto;
  public roles: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private roleService: AdminApiRoleApiClient,
    private userService: AdminApiUserApiClient,
    private utilService: UtilityService,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private cd: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    // Init Form
    this.buildForm();
    //Load data to form
    const roles = this.roleService.getAllRoles();
    this.toggleBlockUI(true);
    forkJoin({
      roles,
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          //Push categories to dropdown list
          const roles = response.roles as RoleDto[];
          roles.forEach((element) => {
            this.roles.push({
              value: element.id,
              label: element.name,
            });
          });
          if (!this.utilService.isEmpty(this.config.data?.id)) {
            this.loadFormDetails(this.config.data?.id);
          } else {
            this.setMode('create');
          }
        },
        error: () => {},
        complete: () => this.toggleBlockUI(false),
      });
  }

  loadFormDetails(id: string) {
    this.userService
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserDto) => {
          this.selectEntity = response;
          this.buildForm();
          this.setMode('update');
        },
        error: () => {},
        complete: () => this.toggleBlockUI(false),
      });
  }

  setMode(mode: string): void {
    if (mode === 'update') {
      this.form.controls['userName'].clearValidators();
      this.form.controls['userName'].disable();
      this.form.controls['email'].clearValidators();
      this.form.controls['email'].disable();
      this.form.controls['password'].clearValidators();
      this.form.controls['password'].disable();
    } else if (mode === 'create') {
      this.form.controls['userName'].addValidators(Validators.required);
      this.form.controls['userName'].enable();
      this.form.controls['email'].addValidators(Validators.required);
      this.form.controls['email'].enable();
      this.form.controls['password'].addValidators(Validators.required);
      this.form.controls['password'].enable();
    }
  }

  onFileChange(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.filse;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({
          avatarFileName: file.name,
          avatarFileContent: reader.result,
        });
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  private saveData() {
    this.toggleBlockUI(true);
    if (this.utilService.isEmpty(this.config.data?.id)) {
      this.userService
        .createUser(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => this.ref.close(this.form.value),
          error: () => {},
          complete: () => this.toggleBlockUI(false),
        });
    } else {
      this.userService
        .updateUser(this.config.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => this.ref.close(this.form.value),
          error: () => {},
          complete: () => this.toggleBlockUI(false),
        });
    }
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    fullName: [{ type: 'required', message: 'Bạn phải nhập tên' }],
    email: [{ type: 'required', message: 'Bạn phải nhập email' }],
    userName: [{ type: 'required', message: 'Bạn phải nhập tài khoản' }],
    password: [
      { type: 'required', message: 'Bạn phải nhập mật khẩu' },
      {
        type: 'pattern',
        message:
          'Mật khẩu ít nhất 8 ký tự, ít nhất 1 số, 1 ký tự đặc biệt, và một chữ hoa',
      },
    ],
    phoneNumber: [{ type: 'required', message: 'Bạn phải nhập số điện thoại' }],
  };

  buildForm(): void {
    this.form = this.formBuilder.group({
      firstName: new FormControl(
        this.selectEntity.firstName || null,
        Validators.required
      ),
      lastName: new FormControl(
        this.selectEntity.lastName || null,
        Validators.required
      ),
      userName: new FormControl(
        this.selectEntity.userName || null,
        Validators.required
      ),
      email: new FormControl(
        this.selectEntity.email || null,
        Validators.required
      ),
      phoneNumber: new FormControl(
        this.selectEntity.phoneNumber || null,
        Validators.required
      ),
      password: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}$'
          ),
        ])
      ),
      dob: new FormControl(
        this.selectEntity.dob
          ? formatDate(this.selectEntity.dob, 'yyyy-MM-dd', 'en')
          : null
      ),
      avatarFile: new FormControl(null),
      avatar: new FormControl(this.selectEntity.avatar || null),
      isActive: new FormControl(this.selectEntity.isActive || false),
      royaltyAmountPerPost: new FormControl(
        this.selectEntity.royaltyAmountPerPost
      ),
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
