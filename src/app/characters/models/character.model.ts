import { FormControl, FormGroup } from "@angular/forms";

export interface CharacterResponse {
  info: CharacterResponseInfo;
  results: CharacterResponseData[];
}

export interface CharacterResponseInfo {
  count: number;
  next: string;
  pages: number;
  prev: number | null;
}

export interface CharacterResponseData {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface CharacterResponseWithEpisodes {
  info: CharacterResponseInfo;
  results: CharacterResponseDataWithEpisodes[];
}

export interface CharacterResponseDataWithEpisodes extends CharacterResponseData {
  episodesData: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface EditCharacterFormGroup {
  name: FormControl<string>;
  status: FormControl<'Alive' | 'Dead' | 'unknown'>;
  gender: FormControl<'Female' | 'Male' | 'Genderless' | 'unknown'>;
  species: FormControl<string>;
  type: FormControl<string>;
  image: FormControl<string>;
  origin: FormGroup<{ name: FormControl<string>; url: FormControl<string> }>;
  location: FormGroup<{ name: FormControl<string>; url: FormControl<string> }>;
  episode: FormControl<string[]>;
  url: FormControl<string>;
  created: FormControl<string>;
}

export type NewCharacter = Pick<CharacterResponseData, 'name' | 'status' | 'image'>;

