import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrigadasComponent } from './brigadas.component';

describe('BrigadasComponent', () => {
  let component: BrigadasComponent;
  let fixture: ComponentFixture<BrigadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrigadasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrigadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
