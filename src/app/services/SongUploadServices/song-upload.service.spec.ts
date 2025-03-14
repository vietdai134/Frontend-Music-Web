import { TestBed } from '@angular/core/testing';

import { SongUploadService } from './song-upload.service';

describe('SongUploadService', () => {
  let service: SongUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
