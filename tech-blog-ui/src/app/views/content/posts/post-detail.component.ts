import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import {
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  PostCategoryDto,
  PostDto,
} from 'src/app/api/admin-api.service.generated';
import { UploadService } from 'src/app/shared/services/upload.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: 'post-detail.component.html',
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public blockedPanelDetail: boolean = false;
  public btnDisabled: boolean = false;
  public form: FormGroup;
  public thumbnailImage: any;
  public postCategories: any[] = [];
  public postCate: any[] = [];

  selectedEntity = {} as PostDto;

  constructor(
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private postCategoryApiClient: AdminApiPostCategoryApiClient,
    private utilService: UtilityService,
    private config: DynamicDialogConfig,
    private postApiClient: AdminApiPostApiClient,
    private uploadService: UploadService
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    // Init from
    this.buildForm();
    //Load data to form
    const categories = this.postCategoryApiClient.getAllPostCategory();

    this.toggleBlockUI(true);
    forkJoin({
      categories,
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          //Push categories to dropdown list
          const categories = response.categories as PostCategoryDto[];
          categories.forEach((element) => {
            this.postCategories.push({
              value: element.id,
              label: element.name,
            });
          });
          this.postCate = this.postCategories;
          if (!this.utilService.isEmpty(this.config.data?.id)) {
            this.loadFormDetails(this.config.data.id);
          } else {
            this.toggleBlockUI(false);
          }
        },
        error: () => this.toggleBlockUI(false),
      });
  }

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

  loadFormDetails(id: string): void {
    this.postApiClient
      .getPostById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostDto) => {
          this.selectedEntity = response;
          this.buildForm();
        },
        complete: () => this.toggleBlockUI(false),
      });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.uploadService.uploadImage('post', event.target.files).subscribe({
        next: (response: any) => {
          this.form.controls['thumbnail'].setValue(response.path);
          this.thumbnailImage = environment.API_URL + response.path;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  generateSlug(): void {
    const slug = this.utilService.generateSlug(this.form.get('name').value);
    this.form.controls['slug'].setValue(slug);
  }

  saveChange(): void {
    this.toggleBlockUI(false);
    this.saveData();
  }

  private saveData(): void {
    this.toggleBlockUI(true);
    if (this.utilService.isEmpty(this.config.data?.id)) {
      this.postApiClient
        .createPost(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form);
          },
          error: () => {},
          complete: () => this.toggleBlockUI(false),
        });
    } else {
      this.postApiClient
        .updatePost(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
          },
          error: () => {},
          complete: () => this.toggleBlockUI(false),
        });
    }
  }

  private toggleBlockUI(enabled: boolean): void {
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
          Validators.maxLength(255),
          Validators.minLength(3),
        ])
      ),
      slug: new FormControl(
        this.selectedEntity.slug || null,
        Validators.required
      ),
      categoryId: new FormControl(
        this.selectedEntity.categoryId || null,
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
      tags: new FormControl(this.selectedEntity.tags || null),
      content: new FormControl(this.selectedEntity.content || null),
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
    });
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail;
    }
  }
}
