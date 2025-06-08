import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterResponseDataWithEpisodes } from '../../models/character.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-character-detail',
  imports: [CommonModule, ButtonModule],
  templateUrl: './character-detail.component.html',
  styleUrl: './character-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterDetailComponent {
  character = input.required<CharacterResponseDataWithEpisodes>();
  isFavorite = input.required<boolean>();
  editCharacter = output<CharacterResponseDataWithEpisodes>();
  deleteCharacter = output<CharacterResponseDataWithEpisodes>();
  toggleFavorite = output<CharacterResponseDataWithEpisodes>();

  onEdit(): void {
    this.editCharacter.emit(this.character());
  }

  onDelete(): void {
    this.deleteCharacter.emit(this.character());
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.character());
  }
}
