import { Route } from '@angular/router';
import { CharacterListComponent } from './characters/components/character-list/character-list.component';
import { CharacterDetailComponent } from './characters/components/character-detail/character-detail.component';
import { EditCharacterComponent } from './characters/components/edit-character/edit-character.component';
import { AddCharacterComponent } from './characters/components/add-character/add-character.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: CharacterListComponent,
  },
  {
    path: 'character/:id',
    component: CharacterDetailComponent,
  },
  {
    path: 'add-character',
    component: AddCharacterComponent,
  },
  {
    path: 'edit-character/:id',
    component: EditCharacterComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
