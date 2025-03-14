import { TestBed } from '@angular/core/testing';

import { SongApprovalService } from './song-approval.service';

describe('SongApprovalService', () => {
  let service: SongApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
