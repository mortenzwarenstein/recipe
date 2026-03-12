import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { MealPlanService } from '../../core/meal-plan/meal-plan.service';
import { MealPlanResponse } from '../../core/meal-plan/meal-plan.models';
import { RecipeResponse } from '../../core/recipes/recipe.models';
import { RecipePickerModalComponent } from '../../shared/recipes/recipe-picker-modal/recipe-picker-modal';
import { getMonday, toDisplayDate, toIsoDate, toIsoWeekString } from '../../shared/utils/date.utils';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-meal-plan',
  imports: [RecipePickerModalComponent],
  templateUrl: './meal-plan.html',
})
export class MealPlanComponent {
  private readonly mealPlanService = inject(MealPlanService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentMonday = signal<Date>(getMonday(new Date()));
  protected readonly weekString = computed(() => toIsoWeekString(this.currentMonday()));
  protected readonly entries = signal<MealPlanResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly pickingDays = signal(new Set<string>());
  protected readonly clearingDays = signal(new Set<string>());
  protected readonly clearingWeek = signal(false);
  protected readonly today = toIsoDate(new Date());

  protected readonly days = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.currentMonday());
      d.setDate(d.getDate() + i);
      return d;
    })
  );

  protected readonly isCurrentWeek = computed(() =>
    toIsoWeekString(getMonday(new Date())) === this.weekString()
  );

  protected readonly dayNames = DAY_NAMES;

  protected readonly pickerDay = signal<string | null>(null);

  constructor() {
    toObservable(this.weekString)
      .pipe(
        switchMap(week => {
          this.loading.set(true);
          this.error.set(null);
          return this.mealPlanService.getWeek(week).pipe(
            catchError(() => {
              this.error.set('Failed to load week plan.');
              this.loading.set(false);
              return of([]);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(entries => {
        this.entries.set(entries);
        this.loading.set(false);
      });
  }

  protected entryForDay(date: Date): MealPlanResponse | undefined {
    return this.entries().find(e => e.plannedDate === toIsoDate(date));
  }

  protected isoDate(date: Date): string {
    return toIsoDate(date);
  }

  protected displayDate(date: Date): string {
    return toDisplayDate(date);
  }

  protected isToday(date: Date): boolean {
    return toIsoDate(date) === this.today;
  }

  protected goToCurrentWeek(): void {
    this.currentMonday.set(getMonday(new Date()));
  }

  protected clearWeek(): void {
    this.clearingWeek.set(true);
    this.mealPlanService.clearWeek(this.weekString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.entries.set([]);
          this.clearingWeek.set(false);
        },
        error: () => {
          this.error.set('Failed to clear week.');
          this.clearingWeek.set(false);
        },
      });
  }

  protected prevWeek(): void {
    this.currentMonday.update(d => {
      const n = new Date(d);
      n.setDate(d.getDate() - 7);
      return n;
    });
  }

  protected nextWeek(): void {
    this.currentMonday.update(d => {
      const n = new Date(d);
      n.setDate(d.getDate() + 7);
      return n;
    });
  }

  protected pickForDay(date: Date): void {
    const isoDate = toIsoDate(date);
    this.pickingDays.update(s => new Set(s).add(isoDate));
    this.mealPlanService.pickForDay(isoDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: entry => {
          this.entries.update(es => [...es.filter(e => e.plannedDate !== isoDate), entry]);
          this.pickingDays.update(s => { const n = new Set(s); n.delete(isoDate); return n; });
        },
        error: () => {
          this.error.set('No unpicked recipes available.');
          this.pickingDays.update(s => { const n = new Set(s); n.delete(isoDate); return n; });
        },
      });
  }

  protected openPickerModal(date: Date): void {
    this.pickerDay.set(toIsoDate(date));
  }

  protected onPickerSelect(recipe: RecipeResponse): void {
    const isoDate = this.pickerDay();
    if (!isoDate) return;
    this.pickerDay.set(null);
    this.pickingDays.update(s => new Set(s).add(isoDate));
    this.mealPlanService.pickSpecificForDay(isoDate, recipe.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: entry => {
          this.entries.update(es => [...es.filter(e => e.plannedDate !== isoDate), entry]);
          this.pickingDays.update(s => { const n = new Set(s); n.delete(isoDate); return n; });
        },
        error: () => {
          this.error.set('Failed to pick recipe.');
          this.pickingDays.update(s => { const n = new Set(s); n.delete(isoDate); return n; });
        },
      });
  }

  protected clearDay(date: Date): void {
    const isoDate = toIsoDate(date);
    this.clearingDays.update(s => new Set(s).add(isoDate));
    this.mealPlanService.clearDay(isoDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.entries.update(es => es.filter(e => e.plannedDate !== isoDate));
          this.clearingDays.update(s => { const n = new Set(s); n.delete(isoDate); return n; });
        },
        error: () => {
          this.error.set('Failed to clear day.');
          this.clearingDays.update(s => { const n = new Set(s); n.delete(isoDate); return n; });
        },
      });
  }
}
