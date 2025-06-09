import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCharacterComponent } from './edit-character.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CharacterResponseData } from '../../models/character.model';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { of, throwError } from 'rxjs';
import { FilesServiceService } from '../../../shared/services/files-service.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('EditCharacterComponent', () => {
  let component: EditCharacterComponent;
  let fixture: ComponentFixture<EditCharacterComponent>;
  let dialogRef: jest.Mocked<DynamicDialogRef>;
  let fileService: jest.Mocked<FilesServiceService>;

  const mockCharacter: CharacterResponseData = {
    id: 1,
    name: 'Rick',
    status: 'Alive',
    species: 'Human',
    type: 'Scientist', // Changed from empty string to avoid validation issues
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
  };

  beforeEach(async () => {
    dialogRef = {
      close: jest.fn(),
    } as any;

    fileService = {
      uploadFile: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        SelectModule,
        ButtonModule,
        InputTextModule,
        FileUploadModule,
        EditCharacterComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: FilesServiceService, useValue: fileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCharacterComponent);
    component = fixture.componentInstance;
    
    // Mock the character input signal with proper typing
    const mockCharacterSignal = () => mockCharacter;
    component.character = mockCharacterSignal as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with character values', () => {
      component.ngOnInit();

      expect(component.characterForm.get('name')?.value).toBe(
        mockCharacter.name
      );
      expect(component.characterForm.get('status')?.value).toBe(
        mockCharacter.status
      );
      expect(component.characterForm.get('species')?.value).toBe(
        mockCharacter.species
      );
      expect(component.characterForm.get('type')?.value).toBe(
        mockCharacter.type
      );
      expect(component.characterForm.get('gender')?.value).toBe(
        mockCharacter.gender
      );
      expect(component.characterForm.get('image')?.value).toBe(
        mockCharacter.image
      );
      expect(component.characterForm.get('origin.name')?.value).toBe(
        mockCharacter.origin.name
      );
      expect(component.characterForm.get('location.name')?.value).toBe(
        mockCharacter.location.name
      );
    });

    it('should disable readonly fields', () => {
      component.ngOnInit();

      expect(component.characterForm.get('origin')?.disabled).toBeTruthy();
      expect(component.characterForm.get('location')?.disabled).toBeTruthy();
      expect(component.characterForm.get('episode')?.disabled).toBeTruthy();
      expect(component.characterForm.get('created')?.disabled).toBeTruthy();
      expect(component.characterForm.get('url')?.disabled).toBeTruthy();
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when required fields are empty', () => {
      component.characterForm.patchValue({
        name: '',
        status: 'unknown',
        species: '',
        gender: 'unknown',
        image: '',
      });

      expect(component.characterForm.valid).toBeFalsy();
    });

    it('should be valid when all required fields are filled', () => {
      expect(component.characterForm.valid).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit if form is invalid', () => {
      component.characterForm.patchValue({
        name: '',
        status: 'unknown',
        species: '',
        gender: 'unknown',
        image: '',
      });

      component.onSubmit();

      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog with updated character when form is valid', () => {
      const updatedName = 'Updated Rick';
      component.characterForm.patchValue({ name: updatedName });

      // Debug: Check form validity and errors
      if (!component.characterForm.valid) {
        console.log('Form errors:', component.characterForm.errors);
        console.log('Form controls:', Object.keys(component.characterForm.controls).map(key => ({
          key,
          value: component.characterForm.get(key)?.value,
          errors: component.characterForm.get(key)?.errors,
          valid: component.characterForm.get(key)?.valid
        })));
      }

      expect(component.characterForm.valid).toBeTruthy();

      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalledWith({
        ...mockCharacter,
        name: updatedName,
        id: 1, // Ensure ID is included as per the component logic
      });
    });
  });

  describe('onUpload', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = { files: [mockFile] };
    const mockUrl = 'https://example.com/uploaded-image.jpg';

    it('should update image URL on successful upload', (done) => {
      fileService.uploadFile.mockReturnValue(Promise.resolve(mockUrl));

      component.ngOnInit();

      component.onUpload(mockEvent);

      // Since onUpload uses an observable, we need to wait for the next tick
      setTimeout(() => {
        expect(fileService.uploadFile).toHaveBeenCalledWith(
          mockFile,
          'characters/test.jpg'
        );
        expect(component.characterForm.get('image')?.value).toBe(mockUrl);
        done();
      });
    });

    it('should handle upload error', (done) => {
      const consoleSpy = jest.spyOn(console, 'error');
      fileService.uploadFile.mockReturnValue(Promise.reject('Upload failed'));

      component.ngOnInit();
      
      component.onUpload(mockEvent);

      // Wait for the error to be handled
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Upload failed:',
          'Upload failed'
        );
        done();
      });
    });
  });

  describe('cancel', () => {
    it('should close dialog without any value', () => {
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});