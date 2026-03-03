import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { HomeComponent } from './features/home/home';
import { RecipeListComponent } from './features/recipes/recipe-list/recipe-list';
import { AddRecipeComponent } from './features/recipes/add-recipe/add-recipe';
import { EditRecipeComponent } from './features/recipes/edit-recipe/edit-recipe';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'recipes', component: RecipeListComponent, canActivate: [authGuard] },
  { path: 'recipes/new', component: AddRecipeComponent, canActivate: [authGuard] },
  { path: 'recipes/:id/edit', component: EditRecipeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
