import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorefrontCampaignCard } from '../../shared/models/storefront-content.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent {
  campaigns = input<StorefrontCampaignCard[]>([]);
}
