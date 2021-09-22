import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaExpedienteComponent } from './alta-expediente.component';

describe('AltaExpedienteComponent', () => {
  let component: AltaExpedienteComponent;
  let fixture: ComponentFixture<AltaExpedienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltaExpedienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaExpedienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
