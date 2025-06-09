import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterDetailComponent } from './character-detail.component';
import { CharacterResponseDataWithEpisodes } from '../../models/character.model';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { spyOn } from 'jest-mock';


describe('CharacterDetailComponent', () => {
  let component: CharacterDetailComponent;
  let fixture: ComponentFixture<CharacterDetailComponent>;
  
  const mockCharacter: CharacterResponseDataWithEpisodes = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: {
      name: 'Earth (C-137)',
      url: 'https://rickandmortyapi.com/api/location/1'
    },
    location: {
      name: 'Citadel of Ricks',
      url: 'https://rickandmortyapi.com/api/location/3'
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: [
      'https://rickandmortyapi.com/api/episode/1',
      'https://rickandmortyapi.com/api/episode/2'
    ],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z',
    episodesData: [
      {
        id: 1,
        name: 'Pilot',
        air_date: 'December 2, 2013',
        episode: 'S01E01',
        characters: [],
        url: 'https://rickandmortyapi.com/api/episode/1',
        created: '2017-11-04T18:48:46.250Z'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterDetailComponent, CommonModule, ButtonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterDetailComponent);
    component = fixture.componentInstance;
    
    // Set required inputs before detectChanges
    fixture.componentRef.setInput('character', mockCharacter);
    fixture.componentRef.setInput('isFavorite', false);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display character details', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rick Sanchez');
    expect(component.character()).toEqual(mockCharacter);
    expect(component.isFavorite()).toBe(false);
  });

  it('should emit edit event when edit button is clicked', () => {
    spyOn(component.editCharacter, 'emit');
    
    fixture.detectChanges();
    component.onEdit();
    
    expect(component.editCharacter.emit).toHaveBeenCalledWith(mockCharacter);
  });

  it('should emit delete event when delete button is clicked', () => {
    spyOn(component.deleteCharacter, 'emit');
    
    fixture.detectChanges();
    component.onDelete();
    
    expect(component.deleteCharacter.emit).toHaveBeenCalledWith(mockCharacter);
  });

  it('should emit toggle favorite event when favorite button is clicked', () => {
    spyOn(component.toggleFavorite, 'emit');
    
    fixture.detectChanges();
    component.onToggleFavorite();
    
    expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockCharacter);
  });

  it('should display favorite button with correct icon based on isFavorite input', () => {
    // Test when not favorite
    fixture.detectChanges();
    expect(component.isFavorite()).toBe(false);
    
    // Test when favorite
    fixture.componentRef.setInput('isFavorite', true);
    fixture.detectChanges();
    expect(component.isFavorite()).toBe(true);
  });

  it('should display episodes when available', () => {
    fixture.detectChanges();
    
    expect(component.character().episodesData).toBeDefined();
    expect(component.character().episodesData!.length).toBeGreaterThan(0);
    expect(component.character().episodesData![0].name).toBe('Pilot');
  });
});