import { Injectable } from '@angular/core';
import { CharacterResponseDataWithEpisodes } from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteCharactersService {
  private storageKey = 'favoriteCharacters';
  constructor() {}

  addToFavorites(character: CharacterResponseDataWithEpisodes): void {
    const favorites = this.getFavorites();
    if (!favorites.some((c) => c.id === character.id)) {
      favorites.push(character);
      this.saveFavorites(favorites);
    }
  }

  removeFromFavorites(characterId: number): void {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.filter((c) => c.id !== characterId);
    this.saveFavorites(updatedFavorites);
  }

  getFavorites(): CharacterResponseDataWithEpisodes[] {
    const favorites = localStorage.getItem(this.storageKey);
    return favorites ? JSON.parse(favorites) : [];
  }

  private saveFavorites(favorites: CharacterResponseDataWithEpisodes[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }
}
