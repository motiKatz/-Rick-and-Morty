import { TestBed } from '@angular/core/testing';

import { FavoriteCharactersService } from './favorite-characters.service';

describe('FavoriteCharactersService', () => {
  let service: FavoriteCharactersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteCharactersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
