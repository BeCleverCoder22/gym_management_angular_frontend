import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../services/subscription.service';
import { Subscription } from '../../../models/subscription';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { normalizePageResponse } from '../../../models/api';

@Component({
  selector: 'app-subscription-list',
  standalone: false,
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {
  subscriptions: Subscription[] = [];
  loading: boolean = true;
  error: string = '';
  page = 0;
  totalPages = 0;
  readonly size = 20;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.error = '';
    this.subscriptionService.getAll({ page: this.page, size: this.size, sort: 'startDate,desc' }).pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        const page = normalizePageResponse<Subscription>(data);
        this.subscriptions = page.content;
        this.totalPages = page.totalPages;
      },
      error: () => {
        this.error = 'Impossible de charger les abonnements. Vérifiez le backend et réessayez.';
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadSubscriptions();
    }
  }

  renewSubscription(id: number): void {
    this.subscriptionService.renew(id).subscribe({
      next: () => this.loadSubscriptions(),
      error: () => this.error = 'Impossible de renouveler cet abonnement.'
    });
  }

  statusLabel(status?: string): string {
    const labels: Record<string, string> = {
      SCHEDULED: 'À venir', ACTIVE: 'Actif', EXPIRED: 'Expiré', CANCELLED: 'Annulé'
    };
    return status ? labels[status] ?? 'Inconnu' : 'Inconnu';
  }

  cancelSubscription(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir résilier cet abonnement ?')) {
      this.subscriptionService.cancel(id).subscribe({
        next: () => {
          this.loadSubscriptions();
        },
        error: (error) => {
          this.error = 'Erreur lors de la résiliation de l\'abonnement';
        }
      });
    }
  }
}