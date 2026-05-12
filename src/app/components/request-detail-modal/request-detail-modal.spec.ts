import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDetailModal } from './request-detail-modal';

describe('RequestDetailModal', () => {
  let component: RequestDetailModal;
  let fixture: ComponentFixture<RequestDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
