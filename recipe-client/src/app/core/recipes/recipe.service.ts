import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateRecipeRequest, UpdateRecipeRequest, RecipeResponse, PagedResponse } from './recipe.models';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  create(request: CreateRecipeRequest): Observable<RecipeResponse> {
    return this.http.post<RecipeResponse>('/api/recipes', request);
  }

  findAll(page = 0, size = 20, q?: string): Observable<PagedResponse<RecipeResponse>> {
    const params: Record<string, string | number> = { page, size };
    if (q) params['q'] = q;
    return this.http.get<PagedResponse<RecipeResponse>>('/api/recipes', { params });
  }

  findById(id: number): Observable<RecipeResponse> {
    return this.http.get<RecipeResponse>(`/api/recipes/${id}`);
  }

  update(id: number, request: UpdateRecipeRequest): Observable<RecipeResponse> {
    return this.http.put<RecipeResponse>(`/api/recipes/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/recipes/${id}`);
  }

  findCurrent(): Observable<RecipeResponse> {
    return this.http.get<RecipeResponse>('/api/recipes/current');
  }

  skip(): Observable<RecipeResponse> {
    return this.http.post<RecipeResponse>('/api/recipes/current/skip', {});
  }

  pick(): Observable<RecipeResponse> {
    return this.http.post<RecipeResponse>('/api/recipes/current/pick', {});
  }

  getBooks(q?: string): Observable<string[]> {
    const params = q ? { params: { q } } : {};
    return this.http.get<string[]>('/api/recipes/books', params);
  }
}
