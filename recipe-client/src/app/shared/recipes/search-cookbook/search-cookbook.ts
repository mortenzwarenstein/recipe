import { Component, DestroyRef, forwardRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { RecipeService } from '../../../core/recipes/recipe.service';

@Component({
  selector: 'app-search-cookbook',
  imports: [ReactiveFormsModule],
  templateUrl: './search-cookbook.html',
  styleUrl: './search-cookbook.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchCookbook),
      multi: true,
    },
  ],
})
export class SearchCookbook implements ControlValueAccessor {
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly inputControl = new FormControl('', { nonNullable: true });
  protected readonly suggestions = signal<string[]>([]);
  protected readonly showDropdown = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.inputControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.onChange(v));

    this.inputControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(q => this.recipeService.getBooks(q)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(books => {
        this.suggestions.set(books);
      });
  }

  writeValue(value: string): void {
    this.inputControl.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable() : this.inputControl.enable();
  }

  protected selectSuggestion(book: string): void {
    this.inputControl.setValue(book, { emitEvent: false });
    this.onChange(book);
    this.suggestions.set([]);
    this.showDropdown.set(false);
  }

  protected onFocus(): void {
    this.recipeService.getBooks(this.inputControl.value).subscribe(books => {
      this.suggestions.set(books);
      this.showDropdown.set(books.length > 0);
    });
  }

  protected onBlur(): void {
    this.onTouched();
    setTimeout(() => this.showDropdown.set(false), 150);
  }
}
