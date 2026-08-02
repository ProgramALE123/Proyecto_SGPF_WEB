import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Alineaciones } from './alineaciones';

describe('Alineaciones', () => {
  let component: Alineaciones;
  let fixture: ComponentFixture<Alineaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alineaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Alineaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
