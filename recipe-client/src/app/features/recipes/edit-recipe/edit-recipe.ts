import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../../core/recipes/recipe.service';
import { SearchCookbook } from '../../../shared/recipes/search-cookbook/search-cookbook';

@Component({
  selector: 'app-edit-recipe',
  imports: [ReactiveFormsModule, RouterLink, SearchCookbook],
  templateUrl: './edit-recipe.html',
})
export class EditRecipeComponent implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly byHeart = signal(false);
  protected readonly caloriesAutoLookupAttempted = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    book: new FormControl<string | null>(null),
    pageNumber: new FormControl<number | null>(null),
    calories: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
  });

  protected readonly loadError = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  ngOnInit(): void {
    this.recipeService.findById(this.id).subscribe({
      next: recipe => {
        const isByHeart = recipe.book == null;
        this.byHeart.set(isByHeart);
        this.caloriesAutoLookupAttempted.set(recipe.book != null);
        this.form.setValue({ name: recipe.name, book: recipe.book ?? null, pageNumber: recipe.pageNumber ?? null, calories: recipe.calories ?? null });
        if (!isByHeart) {
          this.form.controls.book.setValidators([Validators.required]);
          this.form.controls.pageNumber.setValidators([Validators.required, Validators.min(1)]);
          this.form.controls.book.updateValueAndValidity();
          this.form.controls.pageNumber.updateValueAndValidity();
        }
      },
      error: () => this.loadError.set('Recipe not found.'),
    });
  }

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

    const { name, book, pageNumber, calories } = this.form.getRawValue();

    this.recipeService.update(this.id, { name, book, pageNumber, calories }).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (err: unknown) => {
        const detail = err instanceof HttpErrorResponse ? err.error?.detail : undefined;
        this.error.set(detail ?? 'Failed to save changes. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
