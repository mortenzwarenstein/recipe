export interface CreateRecipeRequest {
  name: string;
  book: string | null;
  pageNumber: number | null;
  calories: number | null;
}

export interface UpdateRecipeRequest {
  name: string;
  book: string | null;
  pageNumber: number | null;
  calories: number | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface RecipeResponse {
  id: number;
  name: string;
  book: string | null;
  pageNumber: number | null;
  createdByUsername: string;
  createdAt: string;
  calories: number | null;
}
