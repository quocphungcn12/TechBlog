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
  AdminApiSeriesApiClient,
  SeriesDto,
} from 'src/app/api/admin-api.service.generated';
import { UploadService } from 'src/app/shared/services/upload.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: 'series-detail.component.html',
})
export class SeriesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubcribe = new Subject<void>();
  public blockedPanelDetail: boolean = false;

  // Default
  public btnDisabled: boolean = false;
  public form: FormGroup;

  selectedEntity = {} as SeriesDto;
  public thumbnailImage;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private seriesApiClient: AdminApiSeriesApiClient,
    private utilService: UtilityService,
    private uploadService: UploadService
  ) {}

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    name: [
      { type: 'required', message: 'Bạn phải nhập tên' },
      { type: 'minlength', message: 'Bạn phải nhập ít nhất 3 kí tự' },
      { type: 'maxlength', message: 'Bạn không được nhập quá 255 kí tự' },
    ],
    slug: [{ type: 'required', message: 'Bạn phải URL duy nhất' }],
    description: [{ type: 'required', message: 'Bạn phải nhập mô tả ngắn' }],
  };

  ngOnDestroy(): void {
    this.ngUnsubcribe.next();
    this.ngUnsubcribe.complete();
  }
  ngOnInit(): void {
    // Init Form
    this.buildForm();
    this.toggleBlockUI(true);
    if (!this.utilService.isEmpty(this.config.data?.id)) {
      this.loadFormDetails(this.config.data.id);
    } else {
      this.toggleBlockUI(false);
    }
  }

  loadFormDetails(id: string): void {
    this.seriesApiClient
      .getSeriesById(id)
      .pipe(takeUntil(this.ngUnsubcribe))
      .subscribe({
        next: (response: SeriesDto) => {
          this.selectedEntity = response;
          this.buildForm();
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  generateSlug(): void {
    const slug = this.utilService.generateSlug(
      this.form.controls['name'].value
    );
    this.form.controls['slug'].setValue(slug);
  }

  saveChange(): void {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData(): void {
    if (this.utilService.isEmpty(this.config.data?.id)) {
      this.seriesApiClient
        .createSeries(this.form.value)
        .pipe(takeUntil(this.ngUnsubcribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
          },
          complete: () => this.toggleBlockUI(false),
        });
    } else {
      this.seriesApiClient
        .updateSeries(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubcribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
          },
          complete: () => this.toggleBlockUI(false),
        });
    }
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.uploadService.uploadImage('post', event.target.files).subscribe({
        next: (response: any) => {
          this.form.controls['thumbnail'].setValue(response.path);
          this.thumbnailImage = environment.API_URL + response.path;
        },
        error: (err) => console.log(err),
      });
    }
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
      name: new FormControl(
        this.selectedEntity.name || null,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ])
      ),
      slug: new FormControl(
        this.selectedEntity.slug || null,
        Validators.required
      ),
      description: new FormControl(
        this.selectedEntity.description || null,
        Validators.required
      ),
      seoDescription: new FormControl(
        this.selectedEntity.seoDescription || null,
        Validators.required
      ),
      content: new FormControl(this.selectedEntity.content || null),
      isActive: new FormControl(this.selectedEntity.isActive || null),
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
    });
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail;
    }
  }
}
