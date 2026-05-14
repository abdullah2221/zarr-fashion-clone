import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appPrice',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(value: string | number | undefined): number {
    if (value === undefined) return 0;
    if (typeof value === 'number') return value;
    
    // Extract numbers and decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    return parseFloat(numericValue) || 0;
  }
}
