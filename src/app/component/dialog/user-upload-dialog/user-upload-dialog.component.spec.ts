import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUploadDialogComponent } from './user-upload-dialog.component';

describe('UserUploadDialogComponent', () => {
  let component: UserUploadDialogComponent;
  let fixture: ComponentFixture<UserUploadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUploadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
