import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CharacterListComponent } from './character-list.component';
import { CharacterService } from '../../services/character.service';
import { FavoriteCharactersService } from '../../services/favorite-characters.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import {
  CharacterResponseDataWithEpisodes,
  CharacterResponseWithEpisodes,
} from '../../models/character.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { provideRouter } from '@angular/router';

describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;
  let characterService: jest.Mocked<CharacterService>;
  let favoriteCharactersService: jest.Mocked<FavoriteCharactersService>;
  let dialogService: jest.Mocked<DialogService>;
  let messageService: jest.Mocked<MessageService>;
  let confirmationService: jest.Mocked<ConfirmationService>;

  const mockCharacter: CharacterResponseDataWithEpisodes = {
    id: 1,
    name: 'Rick',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: {
      name: 'Earth',
      url: 'https://rickandmortyapi.com/api/location/1',
    },
    location: {
      name: 'Earth',
      url: 'https://rickandmortyapi.com/api/location/1',
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z',
    episodesData: [],
  };

  const mockCharacterResponse: CharacterResponseWithEpisodes = {
    info: { count: 1, pages: 1, next: '', prev: null },
    results: [mockCharacter],
  };

  beforeEach(async () => {
    characterService = {
      getCharacters: jest.fn(),
      getCharacter: jest.fn(),
      createCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
    } as any;

    favoriteCharactersService = {
      addToFavorites: jest.fn(),
      removeFromFavorites: jest.fn(),
      getFavorites: jest.fn(),
    } as any;

    dialogService = {
      open: jest.fn(),
    } as any;

    messageService = {
      add: jest.fn(),
    } as any;

    confirmationService = {
      confirm: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        Toast,
        ConfirmDialog,
        CharacterListComponent
      ],
      providers: [
        provideRouter([]),
        { provide: CharacterService, useValue: characterService },
        {
          provide: FavoriteCharactersService,
          useValue: favoriteCharactersService,
        },
        { provide: DialogService, useValue: dialogService },
        { provide: MessageService, useValue: messageService },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with favorites and setup search', () => {
      const mockFavorites = [mockCharacter];
      favoriteCharactersService.getFavorites.mockReturnValue(mockFavorites);
      characterService.getCharacters.mockReturnValue(of(mockCharacterResponse));

      component.ngOnInit();

      expect(component.favoriteCharacters()).toEqual(mockFavorites);
      expect(component.searchControl.value).toBe('');
    });
  });

  describe('search functionality', () => {
    it('should fetch characters when search term changes', fakeAsync(() => {
      characterService.getCharacters.mockReturnValue(of(mockCharacterResponse));

      component.ngOnInit();
      component.searchControl.setValue('Rick');
      tick(300);

      expect(characterService.getCharacters).toHaveBeenCalledWith(1, 'Rick');
      expect(component.characters()).toEqual(mockCharacterResponse.results);
    }));

    it('should handle search error', fakeAsync(() => {
      characterService.getCharacters.mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.ngOnInit();
      component.searchControl.setValue('Rick');
      tick(300);

      expect(component.hasMore).toBeFalsy();
      expect(component.characters()).toEqual([]);
    }));
  });

  describe('character management', () => {
    it('should add a new character', () => {
      const newCharacter = {
        name: 'New Character',
        status: 'Alive',
        image: 'image.jpg',
      };

      const mockRef = {
        onClose: of(newCharacter),
      } as DynamicDialogRef;

      dialogService.open.mockReturnValue(mockRef);

      component.onAddCharacter();

      expect(component.characters().length).toBe(1);
      expect(messageService.add).toHaveBeenCalledWith({
        key: 'confirm',
        severity: 'success',
        summary: 'Character was added successfully',
      });
    });

    it('should edit a character', () => {
      const updatedCharacter = { ...mockCharacter, name: 'Updated Rick' };
      const mockRef = {
        onClose: of(updatedCharacter),
      } as DynamicDialogRef;

      dialogService.open.mockReturnValue(mockRef);
      component.characters.set([mockCharacter]);

      component.onEditCharacter(mockCharacter);

      expect(component.characters()[0].name).toBe('Updated Rick');
      expect(messageService.add).toHaveBeenCalledWith({
        key: 'confirm',
        severity: 'success',
        summary: 'Character was edited successfully',
      });
    });

    it('should delete a character', () => {
      component.characters.set([mockCharacter]);
      confirmationService.confirm.mockImplementation((config) => {
        if (config.accept) {
          config.accept();
        }
        return {} as ConfirmationService;
      });

      component.onDeleteCharacter(mockCharacter);

      expect(component.characters().length).toBe(0);
      expect(messageService.add).toHaveBeenCalledWith({
        key: 'confirm',
        severity: 'success',
        summary: 'Character was deleted successfully',
      });
    });
  });

  describe('favorites management', () => {
    it('should toggle favorite status', () => {
      component.favoriteCharacters.set([]);

      component.onToggleFavorite(mockCharacter);

      expect(favoriteCharactersService.addToFavorites).toHaveBeenCalledWith(
        mockCharacter
      );

      component.favoriteCharacters.set([mockCharacter]);

      component.onToggleFavorite(mockCharacter);

      expect(
        favoriteCharactersService.removeFromFavorites
      ).toHaveBeenCalledWith(mockCharacter.id);
    });

    it('should check if character is favorite', () => {
      component.favoriteCharacters.set([mockCharacter]);

      expect(component.isFavorite(mockCharacter)).toBeTruthy();

      component.favoriteCharacters.set([]);

      expect(component.isFavorite(mockCharacter)).toBeFalsy();
    });
  });

  describe('infinite scroll', () => {
    it('should load more characters when scrolling near bottom', () => {
      characterService.getCharacters.mockReturnValue(of(mockCharacterResponse));
      component.characters.set([mockCharacter]);
      component.hasMore = true;
      component.isLoading = false;

      // Mock window scroll position
      Object.defineProperty(window, 'innerHeight', { value: 1000 });
      Object.defineProperty(window, 'scrollY', { value: 1000 });
      Object.defineProperty(document.body, 'offsetHeight', { value: 2000 });

      component.onScroll();

      expect(characterService.getCharacters).toHaveBeenCalledWith(2, '');
      expect(component.characters().length).toBe(2);
    });

    it('should not load more characters when already loading', () => {
      component.isLoading = true;
      component.hasMore = true;

      component.onScroll();

      expect(characterService.getCharacters).not.toHaveBeenCalled();
    });

    it('should not load more characters when no more data', () => {
      component.isLoading = false;
      component.hasMore = false;

      component.onScroll();

      expect(characterService.getCharacters).not.toHaveBeenCalled();
    });
  });
});
