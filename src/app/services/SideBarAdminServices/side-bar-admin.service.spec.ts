import { TestBed } from '@angular/core/testing';

import { SideBarAdminService } from './side-bar-admin.service';

describe('SideBarAdminService', () => {
  let service: SideBarAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideBarAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
