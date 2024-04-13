import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AdminApiAuthApiClient,
  AuthenticatedResult,
  LoginRequest,
} from 'src/app/api/admin-api.service.generated';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UrlConstants } from 'src/app/shared/constants/url.constants';
import { TokenStorageService } from 'src/app/shared/services/token-storage.service';
import { ConstantsType } from 'src/app/shared/constants/type.constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  validatedForm = false;
  loading = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authApiClient: AdminApiAuthApiClient,
    private alertService: AlertService,
    private router: Router,
    private tokenService: TokenStorageService
  ) {
    this.loginForm = this.fb.group({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  login() {
    this.loading = true;
    const loginRequest: LoginRequest = new LoginRequest({
      userName: this.loginForm.controls['userName'].value,
      password: this.loginForm.controls['password'].value,
    });

    // Validate form. If form not valid then alert
    if (this.loginForm.status === ConstantsType.INVALID) {
      this.validatedForm = true;
      this.loading = false;
      return;
    }

    // If form valid then call api login
    this.authApiClient
      .login(loginRequest)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: AuthenticatedResult) => {
          // save access token and refresh token to localstorage
          this.tokenService.saveToken(res.token);
          this.tokenService.saveRefreshToken(res.refreshToken);
          this.tokenService.saveUser(res);
          this.router.navigate([UrlConstants.HOME]);
          this.alertService.showSuccess('Đăng nhập thành công');
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
          this.alertService.showError('Đăng nhập không thành công');
        },
      });
  }
}
