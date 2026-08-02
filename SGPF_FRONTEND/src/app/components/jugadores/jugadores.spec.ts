import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jugadores } from './jugadores';

describe('Jugadores', () => {
  let component: Jugadores;
  let fixture: ComponentFixture<Jugadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jugadores],
    }).compileComponents();

    fixture = TestBed.createComponent(Jugadores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
