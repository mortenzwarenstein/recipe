import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { RecipeService } from '../../../core/recipes/recipe.service';

@Component({
  selector: 'app-edit-recipe',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-recipe.html',
})
export class EditRecipeComponent implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    book: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    pageNumber: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  protected readonly loadError = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  ngOnInit(): void {
    this.recipeService.findById(this.id).subscribe({
      next: recipe => {
        if (recipe.createdByUsername !== this.authService.getUsername()) {
          this.router.navigate(['/recipes']);
          return;
        }
        this.form.setValue({ name: recipe.name, book: recipe.book, pageNumber: recipe.pageNumber });
      },
      error: () => this.loadError.set('Recipe not found.'),
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.error.set(null);
    this.loading.set(true);

    const { name, book, pageNumber } = this.form.getRawValue();

    this.recipeService.update(this.id, { name, book, pageNumber: pageNumber! }).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (err: unknown) => {
        const detail = err instanceof HttpErrorResponse ? err.error?.detail : undefined;
        this.error.set(detail ?? 'Failed to save changes. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
