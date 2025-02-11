import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { path: '/dashboard', icon: 'bi bi-speedometer2', label: 'Tableau de bord' },
    { path: '/customers', icon: 'bi bi-people', label: 'Clients' },
    { path: '/packs', icon: 'bi bi-box', label: 'Offres' },
    { path: '/subscriptions', icon: 'bi bi-card-checklist', label: 'Abonnements' }
  ];
}