import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private title = inject(Title);
  private meta = inject(Meta);

  updateMeta(title: string, description: string, image?: string) {
    this.title.setTitle(`${title} | Zarr Fashion`);
    this.meta.updateTag({ name: 'description', content: description });
    
    // OpenGraph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }
  }
}
