import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRequests } from './admin-requests';

describe('AdminRequests', () => {
  let component: AdminRequests;
  let fixture: ComponentFixture<AdminRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
