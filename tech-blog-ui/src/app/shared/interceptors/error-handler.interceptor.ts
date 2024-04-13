import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AlertService } from '../services/alert.service';

@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {
  constructor(private alertService: AlertService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<Object>> {
    return next.handle(req).pipe(
      catchError((ex) => {
        console.log(ex);
        if (ex.status === 500) {
          this.alertService.showError(
            'Hệ thống có lỗi. Vui lòng liên hệ admin'
          );
        }
        throw ex;
      })
    );
  }
}
