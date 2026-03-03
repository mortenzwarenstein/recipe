import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../../core/recipes/recipe.service';

@Component({
  selector: 'app-add-recipe',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-recipe.html',
})
export class AddRecipeComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    book: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    pageNumber: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.error.set(null);
    this.loading.set(true);

    const { name, book, pageNumber } = this.form.getRawValue();

    this.recipeService.create({ name, book, pageNumber: pageNumber! }).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (err: { error?: { detail?: string } }) => {
        this.error.set(err.error?.detail ?? 'Failed to save recipe. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
