import { TestBed } from '@angular/core/testing';

import { SongLyricService } from './song-lyric.service';

describe('SongLyricService', () => {
  let service: SongLyricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongLyricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
