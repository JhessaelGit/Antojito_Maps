import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantView } from './restaurant-view.component';

describe('RestaurantView', () => {
  let component: RestaurantView;
  let fixture: ComponentFixture<RestaurantView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
