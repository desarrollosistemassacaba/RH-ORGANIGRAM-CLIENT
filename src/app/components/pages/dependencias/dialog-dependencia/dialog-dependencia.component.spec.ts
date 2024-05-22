import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDependenciaComponent } from './dialog-dependencia.component';

describe('DialogDependenciaComponent', () => {
  let component: DialogDependenciaComponent;
  let fixture: ComponentFixture<DialogDependenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDependenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogDependenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
