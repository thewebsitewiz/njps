import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Category } from '@projectgreen/products';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '@env/environment';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'admin-categories-form',
  templateUrl: './categories-form.component.html',
  styles: []
})
export class CategoriesFormComponent implements OnInit, OnDestroy {
  editmode = false;
  form!: FormGroup;
  isSubmitted = false;
  imageDisplay!: string | ArrayBuffer | null | undefined;
  currentCategoryId!: string;
  endsubs$: Subject<any> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._initForm();
    this._checkEditMode();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  private _addCategory(categoryData: FormData) {
    this.categoriesService
      .createCategory(categoryData)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        (category: Category) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Category ${category.name} is created!`
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Category is not created!'
          });
        }
      );
  }

  private _updateCategory(categoryFormData: FormData) {


    this.categoriesService
      .updateCategory(categoryFormData, this.currentCategoryId)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product is updated!'
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Category is not updated!'
          });
        }
      );
  }

  private _checkEditMode() {
    this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
      if (params['id']) {
        this.editmode = true;
        this.currentCategoryId = params['id'];
        this.categoriesService
          .getCategory(params['id'])
          .pipe(takeUntil(this.endsubs$))
          .subscribe((category) => {
            category.image = `${environment.imageUrl}${category.image}`;
            this.categoryForm['name'].setValue(category.name);
            this.imageDisplay = category.image;
            this.categoryForm['image'].setValidators([]);
            this.categoryForm['image'].updateValueAndValidity();
          });
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid) return;

    const categoryFormData = new FormData();
    Object.keys(this.categoryForm).map((key) => {
      categoryFormData.append(key, this.categoryForm[key].value);
    });
    if (this.editmode) {
      this._updateCategory(categoryFormData);
    } else {
      this._addCategory(categoryFormData);
    }
  }
  onCancel() {
    this.location.back();
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file && this.form !== null) {
      this.form.patchValue({ image: file });
      if (this.form.get('image')) {
        this.form.get('image')!.updateValueAndValidity();
      }

      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imageDisplay = fileReader.result;
      };
      fileReader.readAsDataURL(file);
    }
  }

  get categoryForm() {
    return this.form.controls;
  }
}
