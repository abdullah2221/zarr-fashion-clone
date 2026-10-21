import { Pipe, PipeTransform } from '@angular/core';
import { parsePriceValue } from '../utils/price.utils';

@Pipe({
  name: 'appPrice',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(value: string | number | undefined): number {
    if (value === undefined) return 0;
    if (typeof value === 'number') return value;
    
    return parsePriceValue(value);
  }
}
