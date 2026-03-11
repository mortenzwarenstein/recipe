import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { LandingComponent } from './features/landing/landing';
import { HomeComponent } from './features/home/home';
import { RecipeListComponent } from './features/recipes/recipe-list/recipe-list';
import { AddRecipeComponent } from './features/recipes/add-recipe/add-recipe';
import { EditRecipeComponent } from './features/recipes/edit-recipe/edit-recipe';
import { MealPlanComponent } from './features/meal-plan/meal-plan';
import { NotFoundComponent } from './features/not-found/not-found';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'recipes',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', component: RecipeListComponent },
      { path: 'new', component: AddRecipeComponent },
      { path: ':id/edit', component: EditRecipeComponent },
    ]
  },
  { path: 'meal-plan', component: MealPlanComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
