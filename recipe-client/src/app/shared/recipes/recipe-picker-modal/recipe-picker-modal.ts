import { Component, inject, output, signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { RecipeService } from '../../../core/recipes/recipe.service';
import { RecipeResponse } from '../../../core/recipes/recipe.models';

@Component({
  selector: 'app-recipe-picker-modal',
  imports: [FormsModule],
  templateUrl: './recipe-picker-modal.html',
})
export class RecipePickerModalComponent {
  private readonly recipeService = inject(RecipeService);

  readonly recipeSelected = output<RecipeResponse>();
  readonly dismissed = output<void>();

  protected readonly query = signal('');
  protected readonly recipes = signal<RecipeResponse[]>([]);
  protected readonly loading = signal(false);

  private readonly search$ = new Subject<string>();

  constructor() {
    // Initial load — no debounce
    this.loading.set(true);
    this.recipeService.findAll(0, 100).pipe(
      catchError(() => of({ content: [] as RecipeResponse[], totalElements: 0, totalPages: 0, page: 0, size: 0 })),
      takeUntilDestroyed(),
    ).subscribe(page => {
      this.recipes.set(page.content);
      this.loading.set(false);
    });

    // Debounced search for user input
    this.search$
      .pipe(
        debounceTime(250),
        switchMap(q => {
          this.loading.set(true);
          return this.recipeService.findAll(0, 100, q || undefined).pipe(
            catchError(() => of({ content: [] as RecipeResponse[], totalElements: 0, totalPages: 0, page: 0, size: 0 })),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(page => {
        this.recipes.set(page.content);
        this.loading.set(false);
      });
  }

  protected onSearch(q: string): void {
    this.query.set(q);
    this.search$.next(q);
  }

  protected select(recipe: RecipeResponse): void {
    this.recipeSelected.emit(recipe);
  }

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
