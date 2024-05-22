import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOrganigramaComponent } from './dialog-organigrama.component';

describe('DialogOrganigramaComponent', () => {
  let component: DialogOrganigramaComponent;
  let fixture: ComponentFixture<DialogOrganigramaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogOrganigramaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogOrganigramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
