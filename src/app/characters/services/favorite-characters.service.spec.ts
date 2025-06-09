import { TestBed } from '@angular/core/testing';
import { FavoriteCharactersService } from './favorite-characters.service';
import { CharacterResponseDataWithEpisodes } from '../models/character.model';

describe('FavoriteCharactersService', () => {
  let service: FavoriteCharactersService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    const localStorageMock = {
      getItem: (key: string): string => mockLocalStorage[key] || '',
      setItem: (key: string, value: string): void => {
        mockLocalStorage[key] = value;
      },
      clear: (): void => {
        mockLocalStorage = {};
      }
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [FavoriteCharactersService]
    });

    service = TestBed.inject(FavoriteCharactersService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites exist', () => {
      const favorites = service.getFavorites();
      expect(favorites).toEqual([]);
    });

    it('should return favorites from localStorage', () => {
      const mockFavorites: CharacterResponseDataWithEpisodes[] = [
        {
          id: 1,
          name: 'Rick',
          status: 'Alive',
          species: 'Human',
          type: '',
          gender: 'Male',
          origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
          location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
          image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
          episode: ['https://rickandmortyapi.com/api/episode/1'],
          url: 'https://rickandmortyapi.com/api/character/1',
          created: '2017-11-04T18:48:46.250Z',
          episodesData: []
        }
      ];

      localStorage.setItem('favoriteCharacters', JSON.stringify(mockFavorites));
      const favorites = service.getFavorites();
      expect(favorites).toEqual(mockFavorites);
    });
  });

  describe('addToFavorites', () => {
    it('should add a character to favorites', () => {
      const character: CharacterResponseDataWithEpisodes = {
        id: 1,
        name: 'Rick',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z',
        episodesData: []
      };

      service.addToFavorites(character);
      const favorites = service.getFavorites();
      expect(favorites).toContainEqual(character);
    });

    it('should not add duplicate characters', () => {
      const character: CharacterResponseDataWithEpisodes = {
        id: 1,
        name: 'Rick',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z',
        episodesData: []
      };

      service.addToFavorites(character);
      service.addToFavorites(character);
      const favorites = service.getFavorites();
      expect(favorites.length).toBe(1);
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove a character from favorites', () => {
      const character: CharacterResponseDataWithEpisodes = {
        id: 1,
        name: 'Rick',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z',
        episodesData: []
      };

      service.addToFavorites(character);
      service.removeFromFavorites(1);
      const favorites = service.getFavorites();
      expect(favorites).not.toContainEqual(character);
    });

    it('should not affect other favorites when removing one', () => {
      const character1: CharacterResponseDataWithEpisodes = {
        id: 1,
        name: 'Rick',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z',
        episodesData: []
      };

      const character2: CharacterResponseDataWithEpisodes = {
        id: 2,
        name: 'Morty',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
        image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/2',
        created: '2017-11-04T18:48:46.250Z',
        episodesData: []
      };

      service.addToFavorites(character1);
      service.addToFavorites(character2);
      service.removeFromFavorites(1);
      const favorites = service.getFavorites();
      expect(favorites).toContainEqual(character2);
      expect(favorites).not.toContainEqual(character1);
    });
  });
});
