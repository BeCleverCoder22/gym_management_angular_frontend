import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(public authService: AuthService) {}

  menuItems = [
    { path: '/dashboard', icon: 'bi bi-speedometer2', label: 'Tableau de bord' },
    { path: '/customers', icon: 'bi bi-people', label: 'Clients' },
    { path: '/packs', icon: 'bi bi-box', label: 'Offres' },
    { path: '/subscriptions', icon: 'bi bi-card-checklist', label: 'Abonnements' },
    { path: '/payments', icon: 'bi bi-cash-coin', label: 'Paiements' }
  ];

  adminItems = [
    { path: '/users', icon: 'bi bi-person-gear', label: 'Utilisateurs' },
    { path: '/audit', icon: 'bi bi-journal-text', label: 'Audit' },
    { path: '/notifications', icon: 'bi bi-bell', label: 'Notifications' }
  ];
}