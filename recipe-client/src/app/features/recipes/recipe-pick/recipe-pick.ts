import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {RecipeService} from '../../../core/recipes/recipe.service';
import {RecipeResponse} from '../../../core/recipes/recipe.models';
import {BowlService} from '../../../core/bowl/bowl.service';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';

@Component({
  selector: 'app-recipe-pick',
  imports: [],
  templateUrl: './recipe-pick.html',
})
export class RecipePickComponent implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly bowlService = inject(BowlService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recipe = signal<RecipeResponse | undefined>(undefined);
  readonly bowl = toSignal(
    toObservable(this.recipe).pipe(
      switchMap(() => this.bowlService.getBowl())
    ),
    {initialValue: undefined}
  );

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.recipeService.findCurrent().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: recipe => {
        this.recipe.set(recipe);
        this.loading.set(false);
      },
      error: err => this.setError(err),
    });
  }

  protected onSkipRecipeClicked() {
    this.loading.set(true);
    this.recipeService.skip().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: recipe => this.recipe.set(recipe),
      error: err => this.setError(err),
      complete: () => this.loading.set(false),
    });
  }

  protected onNextRecipeClicked() {
    this.loading.set(true);
    this.recipeService.pick().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: recipe => this.recipe.set(recipe),
      error: err => this.setError(err),
      complete: () => this.loading.set(false),
    });
  }

  private setError(err: unknown) {
    const status = err instanceof HttpErrorResponse ? err.status : 0;
    let message = 'Something went wrong.';
    if (status === 404) {
      message = 'There are no recipes available. Check if you have added any, or if your bowl is empty.';
    }
    this.error.set(message);
    this.loading.set(false);
  }
}
