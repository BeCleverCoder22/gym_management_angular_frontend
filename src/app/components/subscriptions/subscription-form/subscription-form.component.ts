import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../../services/subscription.service';
import { CustomerService } from '../../../services/customer.service';
import { PackService } from '../../../services/pack.service';
import { Customer } from '../../../models/customer';
import { Pack } from '../../../models/pack';
import { flush } from '@angular/core/testing';

@Component({
  selector: 'app-subscription-form',
  standalone: false,
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css']
})
export class SubscriptionFormComponent implements OnInit {
  subscriptionForm: FormGroup;
  customers: Customer[] = [];
  packs: Pack[] = [];
  loading: boolean = false;
  error: string = '';
  isEditMode: boolean = false;
  subscriptionId?: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private customerService: CustomerService,
    private packService: PackService
  ) {
    this.subscriptionForm = this.fb.group({
      customerId: ['', Validators.required],
      packId: ['', Validators.required],
      startDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadPacks();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.subscriptionId = id;
      this.loadSubscription(id);
    }
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers = data,
      error: (error) => this.error = 'Erreur lors du chargement des clients'
    });
  }

  loadPacks(): void {
    this.packService.getAll().subscribe({
      next: (data) => this.packs = data,
      error: (error) => this.error = 'Erreur lors du chargement des offres'
    });
  }

  loadSubscription(id: number): void {
    this.subscriptionService.getById(id).subscribe({
      next: (subscription) => {
        this.subscriptionForm.patchValue({
          customerId: subscription.customer?.id,  // 🔹 Récupérer l'ID du client
          packId: subscription.pack?.id,          // 🔹 Récupérer l'ID du pack
          startDate: subscription.startDate ? subscription.startDate.toString().split('T')[0] : '' // 🔹 Formater la date
        });
      },
      error: () => {
        this.error = 'Erreur lors du chargement de l\'abonnement';
      }
    });
  }
  

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      this.loading = true;
      this.error = '';

      const subscription = {
        customerId: +this.subscriptionForm.value.customerId,  // Conversion explicite en number
        packId: +this.subscriptionForm.value.packId,
        startDate: new Date(this.subscriptionForm.value.startDate)
      };

      const request = this.isEditMode
        ? this.subscriptionService.update(this.subscriptionId!, subscription)
        : this.subscriptionService.create(subscription);

      request.subscribe({
        next: () => {
          this.router.navigate(['/subscriptions']);
        },
        error: (error) => {
          this.error = 'Erreur lors de l\'enregistrement de l\'abonnement';
          this.loading = false;
        }
      });
    }
  }
}