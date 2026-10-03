import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuditRecord, NotificationOutboxItem } from '../../models/admin';
import { AdminOperationsService } from '../../services/admin-operations.service';
import { finalize } from 'rxjs';
import { normalizePageResponse } from '../../models/api';

@Component({
  selector: 'app-admin-operations',
  standalone: false,
  templateUrl: './admin-operations.component.html',
  styleUrls: ['./admin-operations.component.css']
})
export class AdminOperationsComponent implements OnInit {
  view: 'audit' | 'notifications' = 'audit';
  auditRecords: AuditRecord[] = [];
  notifications: NotificationOutboxItem[] = [];
  page = 0;
  totalPages = 0;
  loading = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private service: AdminOperationsService,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.view = data['view'] === 'notifications' ? 'notifications' : 'audit';
      this.page = 0;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    if (this.view === 'audit') {
      this.service.getAudit(this.page).pipe(
        finalize(() => {
          this.loading = false;
          if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
        })
      ).subscribe({
        next: response => {
          const page = normalizePageResponse<AuditRecord>(response);
          this.auditRecords = page.content;
          this.finishLoad(page.totalPages);
        },
        error: () => this.failLoad('Impossible de charger le journal. Vérifiez le backend et réessayez.')
      });
      return;
    }

    this.service.getOutbox(this.page).pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: response => {
        const page = normalizePageResponse<NotificationOutboxItem>(response);
        this.notifications = page.content;
        this.finishLoad(page.totalPages);
      },
      error: () => this.failLoad('Impossible de charger les notifications. Vérifiez le backend et réessayez.')
    });
  }

  private finishLoad(totalPages: number): void {
    this.totalPages = totalPages;
    this.loading = false;
  }

  private failLoad(message: string): void {
    this.error = message;
    this.loading = false;
  }

  retry(item: NotificationOutboxItem): void {
    if (!['FAILED', 'RETRYABLE'].includes(item.status.toUpperCase())) return;
    this.service.retryNotification(item.id).subscribe({
      next: () => {
        this.success = 'Nouvelle tentative planifiée.';
        this.load();
      },
      error: () => this.error = 'Impossible de relancer cette notification.'
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.load();
    }
  }
}