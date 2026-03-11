import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import { BowlService } from './bowl.service';

describe('BowlService', () => {
  let service: BowlService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BowlService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getBowl sends GET /api/bowl', () => {
    service.getBowl().subscribe();
    const req = http.expectOne('/api/bowl');
    expect(req.request.method).toBe('GET');
    req.flush({ recipesLeft: 7, recipesPicked: 3 });
  });

  it('getBowl returns the response body', () => {
    let result: { recipesLeft: number; recipesPicked: number } | undefined;
    service.getBowl().subscribe(r => (result = r));
    http.expectOne('/api/bowl').flush({ recipesLeft: 5, recipesPicked: 2 });
    expect(result?.recipesLeft).toBe(5);
    expect(result?.recipesPicked).toBe(2);
  });
});
