import { RecipeResponse } from '../recipes/recipe.models';

export interface MealPlanResponse {
  id: number;
  plannedDate: string;
  recipe: RecipeResponse;
  createdByUsername: string;
}
