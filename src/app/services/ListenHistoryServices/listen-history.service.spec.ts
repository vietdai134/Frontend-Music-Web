import { TestBed } from '@angular/core/testing';

import { ListenHistoryService } from './listen-history.service';

describe('ListenHistoryService', () => {
  let service: ListenHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListenHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
