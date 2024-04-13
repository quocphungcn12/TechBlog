import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class UploadService {
  public responseData: any;

  constructor(private _http: HttpClient) {}

  uploadImage(type: string, file: File[]) {
    const formData: FormData = new FormData();
    formData.append('file', file[0], file[0].name);
    return this._http.post(
      environment.API_URL + '/api/admin/media?type=' + type,
      formData
    );
  }
}
