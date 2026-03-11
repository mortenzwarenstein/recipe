import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import { AuthService } from '../../core/auth/auth.service';
import { HomeComponent } from './home';

const mockAuthService = {
  isAuthenticated: signal(true),
  getUsername: () => 'admin',
  logout: () => {},
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    http.expectOne('/api/bowl');
    expect(component).toBeTruthy();
  });

  it('exposes username from auth service', () => {
    http.expectOne('/api/bowl');
    expect(component['username']).toBe('admin');
  });

  it('loads bowl stats on init', () => {
    const req = http.expectOne('/api/bowl');
    req.flush({ recipesLeft: 5, recipesPicked: 3 });
    expect(component['bowl']()?.recipesLeft).toBe(5);
    expect(component['bowl']()?.recipesPicked).toBe(3);
  });
});
