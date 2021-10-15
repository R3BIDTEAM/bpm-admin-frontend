import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearcadeneroComponent } from './crearcadenero.component';

describe('CrearcadeneroComponent', () => {
  let component: CrearcadeneroComponent;
  let fixture: ComponentFixture<CrearcadeneroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearcadeneroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearcadeneroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
