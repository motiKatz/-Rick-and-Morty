import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CharacterResponseData,
  EditCharacterFormGroup,
} from '../../models/character.model';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { initFormControl } from 'src/app/shared/functions';
import { FileUploadModule } from 'primeng/fileupload';
import { from } from 'rxjs';
import { FilesServiceService } from 'src/app/shared/services/files-service.service';

@Component({
  selector: 'app-edit-character',
  imports: [
    CommonModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    FileUploadModule,
  ],
  templateUrl: './edit-character.component.html',
  styleUrl: './edit-character.component.scss',
})
export class EditCharacterComponent implements OnInit {
  characterForm!: FormGroup<EditCharacterFormGroup>;
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private fileService = inject(FilesServiceService);

  character = input<CharacterResponseData>();

  constructor() {}
  ngOnInit(): void {
    this.initEditCharacterForm();
  }

  initEditCharacterForm() {
    const character: CharacterResponseData = this.character()!;
    this.characterForm = this.fb.group({
      name: initFormControl<string>(character.name, Validators.required),
      status: initFormControl<'Alive' | 'Dead' | 'unknown'>(
        character.status,
        Validators.required
      ),
      gender: initFormControl<'Female' | 'Male' | 'Genderless' | 'unknown'>(
        character.gender,
        Validators.required
      ),
      species: initFormControl<string>(character.species, Validators.required),
      type: initFormControl<string>(character.type, Validators.required),
      image: initFormControl<string>(character.image, Validators.required),

      origin: this.fb.group({
        name: initFormControl<string>(
          character.origin.name,
          Validators.required
        ),
        url: initFormControl<string>(character.origin.url, Validators.required),
      }),
      location: this.fb.group({
        name: initFormControl<string>(
          character.location.name,
          Validators.required
        ),
        url: initFormControl<string>(
          character.location.url,
          Validators.required
        ),
      }),
      episode: initFormControl<string[]>(
        character.episode,
        Validators.required
      ),
      url: initFormControl<string>(character.url, Validators.required),
      created: initFormControl<string>(character.created, Validators.required),
    });

    this.characterForm.get('origin')?.disable();
    this.characterForm.get('location')?.disable();
    this.characterForm.get('episode')?.disable();
    this.characterForm.get('created')?.disable();
    this.characterForm.get('url')?.disable();
  }
  onSubmit(): void {
    if (this.characterForm.valid) {
      const updatedCharacter =
        this.characterForm.getRawValue() as CharacterResponseData;
      updatedCharacter.id = this.character()!.id;
      this.editCharacter(updatedCharacter);
    }
  }

  editCharacter(character: CharacterResponseData): void {
    this.ref.close(character);
  }

  cancel(): void {
    this.ref.close();
  }

  onUpload($event: any) {
    from(
      this.fileService.uploadFile(
        $event.files[0],
        'characters/' + $event.files[0].name
      )
    ).subscribe({
      next: (url) => {
        this.characterForm.patchValue({ image: url });
      },
      error: (error) => {
        console.error('Upload failed:', error);
      },
    });
  }
}
