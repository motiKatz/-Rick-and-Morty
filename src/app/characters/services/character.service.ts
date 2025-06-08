import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, Observable, switchMap } from 'rxjs';
import {
  CharacterResponse,
  CharacterResponseWithEpisodes,
  Episode,
} from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private http = inject(HttpClient);
  private apiCharactersUrl = `${environment.apiBaseUrl}character`;
  private apiLocationsUrl = `${environment.apiBaseUrl}locations`;
  private apiEpisodesUrl = `${environment.apiBaseUrl}episodes`;

  constructor() {}

  // getCharacters(page: number = 1): Observable<CharacterResponse> {
  //   return this.http.get<CharacterResponse>(
  //     `${this.apiCharactersUrl}/?page=${page}`
  //   );
  // }

  getCharacters(
    page: number, name: string = ''
  ): Observable<CharacterResponseWithEpisodes> {
    const url = `${this.apiCharactersUrl}/?page=${page}${name ? `&name=${name}` : ''}`;
    return this.http
      .get<CharacterResponse>(url)
      .pipe(
        mergeMap((response) => {
          const info = response.info;
          return forkJoin(
            response.results.map((character) =>
              forkJoin(
                character.episode.map((url) => this.http.get<Episode>(url))
              ).pipe(
                map((episodes) => ({ ...character, episodesData: episodes }))
              )
            )
          ).pipe(
            map((charactersWithEpisodes) => ({
              info,
              results: charactersWithEpisodes,
            }))
          );
        })
      );
  }

  getCharacter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiCharactersUrl}/${id}`);
  }

  createCharacter(character: any): Observable<any> {
    return this.http.post<any>(`${this.apiCharactersUrl}`, character);
  }

  updateCharacter(id: number, character: any): Observable<any> {
    return this.http.put<any>(`${this.apiCharactersUrl}/${id}`, character);
  }

  deleteCharacter(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiCharactersUrl}/${id}`);
  }
}
