import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeleted } from './admin-deleted';

describe('AdminDeleted', () => {
  let component: AdminDeleted;
  let fixture: ComponentFixture<AdminDeleted>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDeleted]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDeleted);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
