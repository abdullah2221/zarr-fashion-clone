import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  isFocusMode = signal(false);
  
  setFocusMode(value: boolean) {
    this.isFocusMode.set(value);
  }
}
