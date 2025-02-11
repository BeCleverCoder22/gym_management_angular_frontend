import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../services/subscription.service';
import { Subscription } from '../../../models/subscription';
import { Router } from '@angular/router';

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

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionService.getAll().subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des abonnements';
        this.loading = false;
      }
    });
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