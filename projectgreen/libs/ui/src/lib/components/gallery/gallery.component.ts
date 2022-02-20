import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ui-gallery',
  templateUrl: './gallery.component.html',
  styles: []
})
export class GalleryComponent implements OnInit {
  selectedImageUrl!: string;
  showThumbs: boolean = false;

  @Input() images!: string[];

  ngOnInit(): void {
    if (this.hasImages) {
      this.selectedImageUrl = this.images[0];
    }

    if (this.images.length > 1) {
      this.showThumbs = true;
    }
  }

  changeSelectedImage(imageUrl: string) {
    this.selectedImageUrl = imageUrl;
  }



  get hasImages() {
    return this.images?.length > 0;
  }
}
