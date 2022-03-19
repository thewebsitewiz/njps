import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-engagement',
  templateUrl: './engagement.component.html',
  styles: []
})
export class EngagementComponent {
  @Input() pageConfig!: any;
  images!: any;

  constructor() { }


}
