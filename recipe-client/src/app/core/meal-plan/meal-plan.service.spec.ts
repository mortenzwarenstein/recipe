import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import { MealPlanService } from './meal-plan.service';

describe('MealPlanService', () => {
  let service: MealPlanService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MealPlanService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getWeek sends GET /api/mealplan with date param', () => {
    service.getWeek('2026-W11').subscribe();
    const req = http.expectOne(r => r.url === '/api/mealplan' && r.params.get('date') === '2026-W11');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('pickForDay sends PUT /api/mealplan/:date', () => {
    service.pickForDay('2026-03-11').subscribe();
    const req = http.expectOne('/api/mealplan/2026-03-11');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('clearDay sends DELETE /api/mealplan/:date', () => {
    service.clearDay('2026-03-11').subscribe();
    const req = http.expectOne('/api/mealplan/2026-03-11');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('clearWeek sends DELETE /api/mealplan with week param', () => {
    service.clearWeek('2026-W11').subscribe();
    const req = http.expectOne(r => r.url === '/api/mealplan' && r.params.get('week') === '2026-W11');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
