import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUnidadComponent } from './dialog-unidad.component';

describe('DialogUnidadComponent', () => {
  let component: DialogUnidadComponent;
  let fixture: ComponentFixture<DialogUnidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUnidadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogUnidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
