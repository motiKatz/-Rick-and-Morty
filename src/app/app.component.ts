import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CharacterService } from './characters/services/character.service';

@Component({
  imports: [RouterModule],
  providers: [CharacterService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  characterService = inject(CharacterService);
  constructor() {}
  ngOnInit(): void {}
  title = 'rick-and-morty-app';
}
