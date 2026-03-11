import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RecipeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('findAll sends GET /api/recipes with default params', () => {
    service.findAll().subscribe();
    const req = http.expectOne(r => r.url === '/api/recipes');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 });
  });

  it('findAll includes q param when provided', () => {
    service.findAll(0, 20, 'pasta').subscribe();
    const req = http.expectOne(r => r.url === '/api/recipes' && r.params.get('q') === 'pasta');
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 });
  });

  it('findById sends GET /api/recipes/:id', () => {
    service.findById(42).subscribe();
    const req = http.expectOne('/api/recipes/42');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('create sends POST /api/recipes', () => {
    service.create({ name: 'Pasta', book: null, pageNumber: null }).subscribe();
    const req = http.expectOne('/api/recipes');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('update sends PUT /api/recipes/:id', () => {
    service.update(1, { name: 'Updated', book: null, pageNumber: null }).subscribe();
    const req = http.expectOne('/api/recipes/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('delete sends DELETE /api/recipes/:id', () => {
    service.delete(5).subscribe();
    const req = http.expectOne('/api/recipes/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('findCurrent sends GET /api/recipes/current', () => {
    service.findCurrent().subscribe();
    const req = http.expectOne('/api/recipes/current');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('skip sends POST /api/recipes/current/skip', () => {
    service.skip().subscribe();
    const req = http.expectOne('/api/recipes/current/skip');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('pick sends POST /api/recipes/current/pick', () => {
    service.pick().subscribe();
    const req = http.expectOne('/api/recipes/current/pick');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('getBooks sends GET /api/recipes/books without query', () => {
    service.getBooks().subscribe();
    const req = http.expectOne('/api/recipes/books');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getBooks sends q param when provided', () => {
    service.getBooks('silver').subscribe();
    const req = http.expectOne(r => r.url === '/api/recipes/books' && r.params.get('q') === 'silver');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
