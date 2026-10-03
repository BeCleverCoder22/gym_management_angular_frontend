import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logoutError = '';
  organizationLabel = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.organizationService.getCurrent().subscribe({
      next: organization => this.organizationLabel = organization.name || organization.slug,
      error: () => this.organizationLabel = ''
    });
  }

  logout(): void {
    this.logoutError = '';
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.logoutError = 'La déconnexion a échoué. Réessayez.'
    });
  }
}