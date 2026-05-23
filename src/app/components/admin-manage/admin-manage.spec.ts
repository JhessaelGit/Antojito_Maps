import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManage } from './admin-manage';

describe('AdminManage', () => {
  let component: AdminManage;
  let fixture: ComponentFixture<AdminManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
