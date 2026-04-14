import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreate } from './admin-create';

describe('AdminCreate', () => {
  let component: AdminCreate;
  let fixture: ComponentFixture<AdminCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
