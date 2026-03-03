import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { RecipeService } from '../../../core/recipes/recipe.service';
import { RecipeResponse } from '../../../core/recipes/recipe.models';

@Component({
  selector: 'app-recipe-list',
  imports: [RouterLink],
  templateUrl: './recipe-list.html',
})
export class RecipeListComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly authService = inject(AuthService);

  protected readonly recipes = signal<RecipeResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly currentUsername = this.authService.getUsername();
  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly deletingIds = signal(new Set<number>());

  constructor() {
    this.recipeService.findAll().subscribe({
      next: recipes => {
        this.recipes.set(recipes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load recipes.');
        this.loading.set(false);
      },
    });
  }

  protected delete(id: number): void {
    this.deletingIds.update(ids => new Set(ids).add(id));

    this.recipeService.delete(id).subscribe({
      next: () => {
        this.recipes.update(list => list.filter(r => r.id !== id));
        this.deletingIds.update(ids => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
      },
      error: () => {
        this.deletingIds.update(ids => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
        this.error.set('Failed to delete recipe.');
      },
    });
  }
}
