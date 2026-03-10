import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, merge, of, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, skip } from 'rxjs/operators';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RecipeService } from '../../../core/recipes/recipe.service';
import { PagedResponse, RecipeResponse } from '../../../core/recipes/recipe.models';

@Component({
  selector: 'app-recipe-list',
  imports: [RouterLink],
  templateUrl: './recipe-list.html',
})
export class RecipeListComponent implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly query = signal('');
  protected readonly page = signal(0);
  protected readonly pageSize = 20;

  protected readonly pagedData = signal<PagedResponse<RecipeResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingIds = signal(new Set<number>());

  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    const debouncedSearch$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.page.set(0)),
    );

    const pageChange$ = toObservable(this.page).pipe(skip(1));

    merge(of(null), debouncedSearch$, pageChange$)
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.recipeService
            .findAll(this.page(), this.pageSize, this.query() || undefined)
            .pipe(
              catchError(() => {
                this.error.set('Failed to load recipes.');
                this.loading.set(false);
                return EMPTY;
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => {
        this.pagedData.set(data);
        this.loading.set(false);
        this.error.set(null);
      });
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.searchSubject.next(value);
  }

  protected goToPage(p: number): void {
    this.page.set(p);
  }

  protected delete(id: number): void {
    this.deletingIds.update(ids => new Set(ids).add(id));

    this.recipeService.delete(id).subscribe({
      next: () => {
        this.pagedData.update(data =>
          data ? { ...data, content: data.content.filter(r => r.id !== id) } : data,
        );
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
