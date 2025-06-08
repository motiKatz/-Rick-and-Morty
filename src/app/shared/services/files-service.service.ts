import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


@Injectable({
  providedIn: 'root',
})
export class FilesServiceService {

  private storage = getStorage();

  constructor() { }

  uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
  }
}
