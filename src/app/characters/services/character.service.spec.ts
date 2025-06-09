import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CharacterService } from './character.service';
import { environment } from 'src/environments/environment';
import { CharacterResponse, Episode } from '../models/character.model';

describe('CharacterService', () => {
  let service: CharacterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharacterService]
    });

    service = TestBed.inject(CharacterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacters', () => {
    it('should fetch characters with episodes data', () => {
      const mockCharacterResponse: CharacterResponse = {
        info: { count: 1, pages: 1, next: 'null', prev: null },
        results: [{
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
          created: '2017-11-04T18:48:46.250Z'
        }]
      };

      const mockEpisode: Episode = {
        id: 1,
        name: 'Pilot',
        air_date: 'December 2, 2013',
        episode: 'S01E01',
        characters: ['https://rickandmortyapi.com/api/character/1'],
        url: 'https://rickandmortyapi.com/api/episode/1',
        created: '2017-11-10T12:56:33.798Z'
      };

      service.getCharacters(1).subscribe(response => {
        expect(response.info).toEqual(mockCharacterResponse.info);
        expect(response.results[0].name).toBe('Rick');
        expect(response.results[0].episodesData[0].name).toBe('Pilot');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}character/?page=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacterResponse);

      const episodeReq = httpMock.expectOne('https://rickandmortyapi.com/api/episode/1');
      expect(episodeReq.request.method).toBe('GET');
      episodeReq.flush(mockEpisode);
    });

    it('should include name parameter in URL when provided', () => {
      service.getCharacters(1, 'Rick').subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}character/?page=1&name=Rick`);
      expect(req.request.method).toBe('GET');
      req.flush({ info: { count: 0, pages: 0, next: null, prev: null }, results: [] });
    });
  });

  describe('getCharacter', () => {
    it('should fetch a single character by id', () => {
      const mockCharacter = {
        id: 1,
        name: 'Rick',
        status: 'Alive'
      };

      service.getCharacter(1).subscribe(character => {
        expect(character).toEqual(mockCharacter);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}character/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);
    });
  });

  describe('createCharacter', () => {
    it('should create a new character', () => {
      const newCharacter = {
        name: 'New Character',
        status: 'Alive',
        species: 'Human'
      };

      service.createCharacter(newCharacter).subscribe(response => {
        expect(response).toEqual({ ...newCharacter, id: 1 });
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}character`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCharacter);
      req.flush({ ...newCharacter, id: 1 });
    });
  });

  describe('updateCharacter', () => {
    it('should update an existing character', () => {
      const updatedCharacter = {
        id: 1,
        name: 'Updated Character',
        status: 'Dead'
      };

      service.updateCharacter(1, updatedCharacter).subscribe(response => {
        expect(response).toEqual(updatedCharacter);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}character/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedCharacter);
      req.flush(updatedCharacter);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete a character', () => {
      service.deleteCharacter(1).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}character/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
