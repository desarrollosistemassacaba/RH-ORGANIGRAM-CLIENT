import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNivelComponent } from './dialog-nivel.component';

describe('DialogNivelComponent', () => {
  let component: DialogNivelComponent;
  let fixture: ComponentFixture<DialogNivelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNivelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogNivelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
