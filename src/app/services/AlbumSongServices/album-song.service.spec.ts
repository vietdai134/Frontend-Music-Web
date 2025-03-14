import { TestBed } from '@angular/core/testing';

import { AlbumSongService } from './album-song.service';

describe('AlbumSongService', () => {
  let service: AlbumSongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlbumSongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
