import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import { RecipePickerModalComponent } from './recipe-picker-modal';
import { RecipeResponse } from '../../../core/recipes/recipe.models';

const recipe = (id: number, name: string): RecipeResponse => ({
  id, name, book: null, pageNumber: null, createdByUsername: 'admin', createdAt: '', calories: null,
});

const emptyPage = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 100 };

describe('RecipePickerModalComponent', () => {
  let component: RecipePickerModalComponent;
  let fixture: ComponentFixture<RecipePickerModalComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipePickerModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipePickerModalComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('loads all recipes on init', () => {
    const req = http.expectOne(r => r.url === '/api/recipes' && !r.params.has('q'));
    expect(req.request.method).toBe('GET');
    req.flush({ content: [recipe(1, 'Pasta'), recipe(2, 'Risotto')], totalElements: 2, totalPages: 1, page: 0, size: 100 });
    expect(component['recipes']()).toHaveLength(2);
  });

  it('emits recipeSelected when a recipe is selected', () => {
    http.expectOne(r => r.url === '/api/recipes').flush(emptyPage);
    const spy = vi.fn();
    component.recipeSelected.subscribe(spy);
    component['select'](recipe(1, 'Pasta'));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Pasta' }));
  });

  it('emits dismissed when dismiss is called', () => {
    http.expectOne(r => r.url === '/api/recipes').flush(emptyPage);
    const spy = vi.fn();
    component.dismissed.subscribe(spy);
    component['dismiss']();
    expect(spy).toHaveBeenCalled();
  });

  it('updates query signal on search', () => {
    http.expectOne(r => r.url === '/api/recipes').flush(emptyPage);
    component['onSearch']('pasta');
    expect(component['query']()).toBe('pasta');
  });
});
