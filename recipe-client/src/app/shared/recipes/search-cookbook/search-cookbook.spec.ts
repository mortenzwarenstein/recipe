import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCookbook } from './search-cookbook';

describe('SearchCookbook', () => {
  let component: SearchCookbook;
  let fixture: ComponentFixture<SearchCookbook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCookbook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCookbook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
