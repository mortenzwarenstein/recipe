import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { HomeComponent } from './features/home/home';
import { RecipeListComponent } from './features/recipes/recipe-list/recipe-list';
import { AddRecipeComponent } from './features/recipes/add-recipe/add-recipe';
import { EditRecipeComponent } from './features/recipes/edit-recipe/edit-recipe';
import { RecipePickComponent } from './features/recipes/recipe-pick/recipe-pick';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'recipes',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', component: RecipeListComponent },
      { path: 'new', component: AddRecipeComponent },
      { path: ':id/edit', component: EditRecipeComponent },
      { path: 'pick' , component: RecipePickComponent }
    ]
  },
  { path: '**', redirectTo: '' },
];
