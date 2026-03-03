export interface CreateRecipeRequest {
  name: string;
  book: string;
  pageNumber: number;
}

export interface UpdateRecipeRequest {
  name: string;
  book: string;
  pageNumber: number;
}

export interface RecipeResponse {
  id: number;
  name: string;
  book: string;
  pageNumber: number;
  createdByUsername: string;
  createdAt: string;
}
