import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MealPlanResponse } from './meal-plan.models';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private readonly http = inject(HttpClient);

  getWeek(week: string): Observable<MealPlanResponse[]> {
    return this.http.get<MealPlanResponse[]>('/api/mealplan', { params: { date: week } });
  }

  pickForDay(date: string): Observable<MealPlanResponse> {
    return this.http.put<MealPlanResponse>(`/api/mealplan/${date}`, {});
  }

  clearDay(date: string): Observable<void> {
    return this.http.delete<void>(`/api/mealplan/${date}`);
  }

  clearWeek(week: string): Observable<void> {
    return this.http.delete<void>('/api/mealplan', { params: { week } });
  }
}
