import { TestBed } from '@angular/core/testing';

import { Restaurante } from './restaurante.service';

describe('Restaurante', () => {
  let service: Restaurante;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Restaurante);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
