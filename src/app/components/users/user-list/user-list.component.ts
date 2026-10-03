import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { finalize } from 'rxjs';
import { normalizePageResponse } from '../../../models/api';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  page = 0;
  totalPages = 0;
  readonly size = 20;

  constructor(
    private userService: UserService,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getUsers({ page: this.page, size: this.size, sort: 'createdAt,desc' }).pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        const page = normalizePageResponse<User>(response);
        this.users = page.content;
        this.totalPages = page.totalPages;
      },
      error: () => {
        this.error = 'Impossible de charger les utilisateurs. Vérifiez le backend et réessayez.';
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadUsers();
    }
  }

  deleteUser(id: number): void {
    if (confirm('Désactiver cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.map(user => user.id === id ? { ...user, enabled: false } : user);
        },
        error: () => {
          this.error = "Erreur lors de la suppression de l'utilisateur";
        }
      });
    }
  }
}