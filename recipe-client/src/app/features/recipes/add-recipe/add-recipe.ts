import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../../core/recipes/recipe.service';
import { SearchCookbook } from '../../../shared/recipes/search-cookbook/search-cookbook';

@Component({
  selector: 'app-add-recipe',
  imports: [ReactiveFormsModule, RouterLink, SearchCookbook],
  templateUrl: './add-recipe.html',
})
export class AddRecipeComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  protected readonly byHeart = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    book: new FormControl<string | null>(null),
    pageNumber: new FormControl<number | null>(null),
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected toggleByHeart(checked: boolean): void {
    this.byHeart.set(checked);
    if (checked) {
      this.form.controls.book.setValue(null);
      this.form.controls.book.clearValidators();
      this.form.controls.pageNumber.setValue(null);
      this.form.controls.pageNumber.clearValidators();
    } else {
      this.form.controls.book.setValidators([Validators.required]);
      this.form.controls.pageNumber.setValidators([Validators.required, Validators.min(1)]);
    }
    this.form.controls.book.updateValueAndValidity();
    this.form.controls.pageNumber.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.error.set(null);
    this.loading.set(true);

    const { name, book, pageNumber } = this.form.getRawValue();

    this.recipeService.create({ name, book, pageNumber }).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (err: unknown) => {
        const detail = err instanceof HttpErrorResponse ? err.error?.detail : undefined;
        this.error.set(detail ?? 'Failed to save recipe. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
