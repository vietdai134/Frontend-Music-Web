import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongApprovalComponent } from './song-approval.component';

describe('SongApprovalComponent', () => {
  let component: SongApprovalComponent;
  let fixture: ComponentFixture<SongApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
