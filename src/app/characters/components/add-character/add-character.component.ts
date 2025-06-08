import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  EditCharacterFormGroup,
  NewCharacter,
} from '../../models/character.model';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { initFormControl } from 'src/app/shared/functions';
import { FileUploadModule } from 'primeng/fileupload';
import { FilesServiceService } from 'src/app/shared/services/files-service.service';
import { file } from '@rxweb/reactive-form-validators';
import { from, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-character',
  imports: [
    CommonModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    FileUploadModule,
  ],
  templateUrl: './add-character.component.html',
  styleUrl: './add-character.component.scss',
})
export class AddCharacterComponent implements OnInit {
  characterForm!: FormGroup<
    Pick<EditCharacterFormGroup, 'name' | 'status' | 'image'>
  >;
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private fileService = inject(FilesServiceService);

  constructor() {}

  ngOnInit(): void {
    this.initCreateCharacterForm();
  }

  initCreateCharacterForm() {
    this.characterForm = this.fb.group({
      name: initFormControl<string>('', Validators.required),
      status: initFormControl<'Alive' | 'Dead' | 'unknown'>(
        'Alive',
        Validators.required
      ),
      image: initFormControl<string>('', Validators.required),
    });
  }

  onSubmit(): void {
    if (this.characterForm.valid) {
      const newCharacter: NewCharacter = this.characterForm.getRawValue();
      this.createCharacter(newCharacter);
    }
  }

  createCharacter(character: NewCharacter): void {
    this.ref.close(character);
  }

  cancel(): void {
    this.ref.close();
  }

  onUpload($event: any) {    
    from(this.fileService
      .uploadFile($event.files[0], 'characters/' + $event.files[0].name))
      .subscribe({
        next: (url) => {
          this.characterForm.patchValue({ image: url });
        },
        error: (error) => {
          console.error('Upload failed:', error);
        },
      });
  }
}
