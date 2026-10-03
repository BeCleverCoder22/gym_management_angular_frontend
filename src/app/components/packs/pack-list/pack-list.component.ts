import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { PackService } from '../../../services/pack.service';
import { Pack } from '../../../models/pack';
import { AuthService } from '../../../services/auth.service';
import { finalize } from 'rxjs';
import { normalizePageResponse } from '../../../models/api';


@Component({
  selector: 'app-pack-list',
  standalone: false,
  templateUrl: './pack-list.component.html',
  styleUrls: ['./pack-list.component.css']
})
export class PackListComponent implements OnInit {
  packs: Pack[] = [];
  loading = false;
  error = '';
  page = 0;
  totalPages = 0;
  readonly size = 20;
  constructor(
    private packService: PackService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  get isAdmin(): boolean {
    return this.authService.currentUserSubjectValue?.role === 'ADMIN';
  }

  ngOnInit(): void {
    this.loadPacks();
  }

  loadPacks(): void {
    this.loading = true;
    this.error = '';
    this.packService.getAll({ page: this.page, size: this.size, sort: 'createdAt,desc' }).pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        const page = normalizePageResponse<Pack>(data);
        this.packs = page.content;
        this.totalPages = page.totalPages;
      },
      error: () => {
        this.error = 'Impossible de charger les offres. Vérifiez le backend et réessayez.';
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadPacks();
    }
  }

  toggleActive(pack: Pack): void {
    if (!this.isAdmin || pack.id === undefined) return;
    this.packService.setActive(pack.id, !pack.active).subscribe({
      next: updated => pack.active = updated.active,
      error: () => this.error = 'Impossible de modifier le statut de cette offre.'
    });
  }
}