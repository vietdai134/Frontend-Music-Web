import { TestBed } from '@angular/core/testing';

import { GeniusService } from './genius.service';

describe('GeniusService', () => {
  let service: GeniusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeniusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
