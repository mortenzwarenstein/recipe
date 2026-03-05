import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateRecipeRequest, UpdateRecipeRequest, RecipeResponse } from './recipe.models';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  create(request: CreateRecipeRequest): Observable<RecipeResponse> {
    return this.http.post<RecipeResponse>('/api/recipes', request);
  }

  findAll(): Observable<RecipeResponse[]> {
    return this.http.get<RecipeResponse[]>('/api/recipes');
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
}
