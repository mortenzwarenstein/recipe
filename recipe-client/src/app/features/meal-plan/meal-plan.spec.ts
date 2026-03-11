import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { toIsoWeekString, getMonday } from '../../shared/utils/date.utils';
import { MealPlanComponent } from './meal-plan';

describe('MealPlanComponent', () => {
  let component: MealPlanComponent;
  let fixture: ComponentFixture<MealPlanComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MealPlanComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    http.expectOne(r => r.url === '/api/mealplan');
    expect(component).toBeTruthy();
  });

  it('initialises to the current week', () => {
    http.expectOne(r => r.url === '/api/mealplan');
    const expectedWeek = toIsoWeekString(getMonday(new Date()));
    expect(component['weekString']()).toBe(expectedWeek);
  });

  it('isCurrentWeek returns true initially', () => {
    http.expectOne(r => r.url === '/api/mealplan');
    expect(component['isCurrentWeek']()).toBe(true);
  });

  it('prevWeek navigates to the previous week', () => {
    http.expectOne(r => r.url === '/api/mealplan').flush([]);
    component['prevWeek']();
    const req = http.expectOne(r => r.url === '/api/mealplan');
    expect(component['isCurrentWeek']()).toBe(false);
    req.flush([]);
  });

  it('nextWeek navigates to the next week', () => {
    http.expectOne(r => r.url === '/api/mealplan').flush([]);
    component['nextWeek']();
    const req = http.expectOne(r => r.url === '/api/mealplan');
    expect(component['isCurrentWeek']()).toBe(false);
    req.flush([]);
  });

  it('goToCurrentWeek restores current week', () => {
    http.expectOne(r => r.url === '/api/mealplan').flush([]);
    component['prevWeek']();
    http.expectOne(r => r.url === '/api/mealplan').flush([]);
    component['goToCurrentWeek']();
    http.expectOne(r => r.url === '/api/mealplan').flush([]);
    expect(component['isCurrentWeek']()).toBe(true);
  });

  it('days computed signal returns 7 days starting from Monday', () => {
    http.expectOne(r => r.url === '/api/mealplan');
    const days = component['days']();
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1); // Monday
    expect(days[6].getDay()).toBe(0); // Sunday
  });

  it('isToday returns true for today', () => {
    http.expectOne(r => r.url === '/api/mealplan');
    expect(component['isToday'](new Date())).toBe(true);
  });

  it('isToday returns false for yesterday', () => {
    http.expectOne(r => r.url === '/api/mealplan');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(component['isToday'](yesterday)).toBe(false);
  });
});
