import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrPaymentComponent } from './qr-payment.component';

describe('QrPaymentComponent', () => {
  let component: QrPaymentComponent;
  let fixture: ComponentFixture<QrPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrPaymentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
