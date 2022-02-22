import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Delivery, DeliveryService } from '@projectgreen/orders';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { environment } from '@env/environment';

@Component({
  selector: 'admin-delivery-list',
  templateUrl: './delivery-list.component.html',
  styles: []
})
export class DeliveryListComponent implements OnInit, OnDestroy {
  deliveries: any = [];
  endsubs$: Subject<any> = new Subject();
  protocol: string = '';
  host: string = '';
  first: number = 0;
  totalRecords!: number;

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this._getDeliveries();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _getDeliveries() {
    this.deliveryService
      .getDeliveries()
      .pipe(takeUntil(this.endsubs$))
      .subscribe((deliveries: any) => {
        this.deliveries = deliveries;
      });
  }

  reset() {
    this.first = 0;
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  updateDelivery(productid: string) {
    this.router.navigateByUrl(`deliveries/form/${productid}`);
  }

  deleteDelivery(deliveryId: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this delivery?',
      header: 'Delete delivery',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deliveryService
          .deleteDelivery(deliveryId)
          .pipe(takeUntil(this.endsubs$))
          .subscribe(
            () => {
              this._getDeliveries();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'delivery is deleted!'
              });
            },
            () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'delivery is not deleted!'
              });
            }
          );
      }
    });
  }
}
