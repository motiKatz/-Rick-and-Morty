import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CharacterResponseData,
  CharacterResponseDataWithEpisodes,
  CharacterResponseWithEpisodes,
  NewCharacter,
} from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditCharacterComponent } from '../edit-character/edit-character.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { CharacterDetailComponent } from '../character-detail/character-detail.component';
import { AddCharacterComponent } from '../add-character/add-character.component';
import { FavoriteCharactersService } from '../../services/favorite-characters.service';
@Component({
  selector: 'app-character-list',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    Toast,
    ConfirmDialog,
    CharacterDetailComponent,
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './character-list.component.html',
  styleUrl: './character-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterListComponent implements OnInit {
  searchControl = new FormControl<null | string>(null);
  private destroyRef = inject(DestroyRef);
  private characterService = inject(CharacterService);
  private favoriteCharactersService = inject(FavoriteCharactersService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  characters = signal<CharacterResponseDataWithEpisodes[]>([]);
  favoriteCharacters = signal<CharacterResponseDataWithEpisodes[]>([]);
  ref: DynamicDialogRef | undefined;
  currentPage = 1;
  isLoading = false;
  hasMore = true;

  constructor() {}
  ngOnInit(): void {
    this.favoriteCharacters.set(this.favoriteCharactersService.getFavorites());
    this.setupSearchWithScroll();
    this.searchControl.setValue('');
    window.addEventListener('scroll', this.onScroll);
  }
  onAddCharacter(): void {
    this.ref = this.dialogService.open(AddCharacterComponent, {
      header: 'Add Character',
      width: '50%',
      closable: true,
    });
    this.ref.onClose.subscribe((character?: NewCharacter) => {
      if (!character) return;
      const newCharacter: CharacterResponseDataWithEpisodes = {
        id: Math.floor(Math.random() * 10000),
        name: character.name,
        status: character.status,
        species: 'Unknown',
        type: 'Unknown',
        gender: 'unknown',
        origin: { name: 'Unknown', url: '' },
        location: { name: 'Unknown', url: '' },
        image: character.image,
        episode: [],
        episodesData: [],
        url: '',
        created: new Date().toISOString(),
      };
      this.characters.update((prevCharacters) => [
        ...prevCharacters,
        newCharacter,
      ]);
      this.messageService.add({
        key: 'confirm',
        severity: 'success',
        summary: 'Character was added successfully',
      });
    });
  }

  onEditCharacter(character: CharacterResponseData): void {
    this.ref = this.dialogService.open(EditCharacterComponent, {
      header: 'Edit Character',
      inputValues: { character: character },
      width: '50%',
      closable: true,
    });
    this.ref.onClose.subscribe((character?: CharacterResponseData) => {
      if (!character) return;
      this.editCharacter(character);
      this.messageService.add({
        key: 'confirm',
        severity: 'success',
        summary: 'Character was edited successfully',
      });
    });
  }

  editCharacter(character: CharacterResponseData): void {
    const index = this.characters().findIndex((c) => c.id === character.id);
    if (index !== -1) {
      this.characters.update((prevCharacters) => {
        const updatedCharacters = [...prevCharacters];
        updatedCharacters[index] = {
          ...updatedCharacters[index],
          ...character,
        };
        return updatedCharacters;
      });
    }
  }

  onDeleteCharacter(character: CharacterResponseData): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this character?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.deleteCharacter(character);
      },
      reject: () => {},
    });
  }

  deleteCharacter(character: CharacterResponseData): void {
    this.characters.update((prev) => prev.filter((c) => c.id !== character.id));
    this.messageService.add({
      key: 'confirm',
      severity: 'success',
      summary: 'Character was deleted successfully',
    });
  }

  setupSearchWithScroll(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.currentPage = 1;
          this.hasMore = true;
          this.characters.set([]);
          this.isLoading = true;
        }),
        switchMap((term) => this.fetchCharacters()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.handleCharacterResponse(res, { append: false });
      });
  }

  fetchCharacters(): Observable<CharacterResponseWithEpisodes> {
    const page = this.currentPage;
    const name = this.searchControl.value || '';
    this.isLoading = true;
    this.currentPage++;
    return this.characterService.getCharacters(page, name).pipe(
      catchError(() => {
        this.hasMore = false;
        return of({
          info: { count: 0, pages: 0, next: '', prev: null },
          results: [],
        });
      }),
      finalize(() => (this.isLoading = false))
    );
  }

  loadMoreCharacters(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.fetchCharacters().subscribe({
      next: (res) => {
        this.handleCharacterResponse(res, { append: true });
      },
      error: () => {
        this.hasMore = false;
      },
      complete: () => (this.isLoading = false),
    });
  }

  handleCharacterResponse(
    res: CharacterResponseWithEpisodes,
    { append }: { append: boolean } = { append: false }
  ): void {
    if (append) {
      this.characters.update((prev) => [...prev, ...res.results]);
    } else {
      this.characters.set(res.results);
    }

    this.hasMore = !!res.info.next;
  }

  onScroll = (): void => {
    const threshold = 300;
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;

    if (height - position < threshold) {
      this.loadMoreCharacters();
    }
  };

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll, true);
  }

  trackByCharacterId(index: number, character: CharacterResponseData): number {
    return character.id;
  }

  onToggleFavorite(character: CharacterResponseDataWithEpisodes): void {
    if (this.isFavorite(character)) {
      this.favoriteCharactersService.removeFromFavorites(character.id);
    } else {
      this.favoriteCharactersService.addToFavorites(character);
    }
    this.favoriteCharacters.set(this.favoriteCharactersService.getFavorites());
  }

  isFavorite(character: any): boolean {
    return this.favoriteCharacters().some((c) => c.id === character.id);
  }
}
