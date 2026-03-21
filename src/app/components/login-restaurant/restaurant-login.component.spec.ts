import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantLoginComponent } from './restaurant-login.component';

describe('RestaurantLoginComponent', () => {
  let component: RestaurantLoginComponent;
  let fixture: ComponentFixture<RestaurantLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      
      imports: [RestaurantLoginComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});