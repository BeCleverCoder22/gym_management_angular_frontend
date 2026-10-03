import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CreatePaymentRequest, Payment, PaymentMethod } from '../../models/payment';
import { Subscription } from '../../models/subscription';
import { PaymentService } from '../../services/payment.service';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { normalizePageResponse } from '../../models/api';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit {
  payments: Payment[] = [];
  subscriptions: Subscription[] = [];
  page = 0;
  totalPages = 0;
  loading = false;
  submitting = false;
  error = '';
  success = '';
  idempotencyKey = '';
  retryRequest: CreatePaymentRequest | null = null;
  get isAdmin(): boolean {
    return this.authService.currentUserSubjectValue?.role === 'ADMIN';
  }

  readonly methods: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH', label: 'Espèces' },
    { value: 'CARD', label: 'Carte' },
    { value: 'MOBILE_MONEY', label: 'Mobile money' },
    { value: 'BANK_TRANSFER', label: 'Virement' }
  ];
  readonly paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {
    this.paymentForm = this.fb.group({
      subscriptionId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.01)]],
      currency: ['XOF', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      method: ['CASH' as PaymentMethod, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.subscriptionService.getAll({ page: 0, size: 100, sort: 'startDate,desc' }).subscribe({
      next: response => {
        this.subscriptions = response.content.filter(item => item.status === 'ACTIVE' || item.status === 'SCHEDULED');
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      },
      error: () => this.error = 'Impossible de charger les abonnements.'
    });
  }

  loadPayments(): void {
    this.loading = true;
    this.error = '';
    this.paymentService.getAll(this.page).pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: response => {
        const page = normalizePageResponse<Payment>(response);
        this.payments = page.content;
        this.totalPages = page.totalPages;
      },
      error: () => {
        this.error = 'Impossible de charger les paiements. Vérifiez le backend et réessayez.';
      }
    });
  }

  submitPayment(): void {
    if (this.submitting || (!this.retryRequest && this.paymentForm.invalid)) return;
    const form = this.paymentForm.getRawValue();
    const request = this.retryRequest ?? {
      subscriptionId: Number(form.subscriptionId),
      amount: form.amount!,
      currency: form.currency!,
      method: form.method!,
      idempotencyKey: globalThis.crypto.randomUUID()
    };
    this.retryRequest = request;
    this.idempotencyKey = request.idempotencyKey;
    this.paymentForm.disable();
    this.submitting = true;
    this.error = '';
    this.paymentService.create(request).subscribe({
      next: () => {
        this.retryRequest = null;
        this.idempotencyKey = '';
        this.paymentForm.reset({ currency: 'XOF', method: 'CASH' });
        this.paymentForm.enable();
        this.success = 'Paiement enregistré en attente de traitement.';
        this.submitting = false;
        this.loadPayments();
      },
      error: () => {
        this.error = 'Le paiement n’a pas pu être confirmé. Réessayez sans modifier les données.';
        this.paymentForm.disable();
        this.submitting = false;
      }
    });
  }

  confirmCash(payment: Payment): void {
    if (!this.isAdmin || payment.method !== 'CASH' || payment.status !== 'PENDING') return;
    if (confirm('Confirmer la réception de ce paiement en espèces ?')) {
      this.paymentService.confirmCash(payment.id).subscribe({
        next: () => this.loadPayments(),
        error: () => this.error = 'Impossible de confirmer le paiement.'
      });
    }
  }

  requestRefund(payment: Payment): void {
    if (!this.isAdmin || payment.status === 'PENDING') return;
    const amountText = prompt(`Montant à rembourser (déjà remboursé : ${payment.refundedAmount})`);
    if (amountText === null || !/^\d+(\.\d{1,2})?$/.test(amountText)) return;
    const reason = prompt('Motif de la demande de remboursement');
    if (!reason?.trim()) return;
    if (confirm('Envoyer une demande de remboursement ? Elle ne signifie pas que le remboursement est déjà exécuté.')) {
      this.paymentService.refund(payment.id, Number(amountText), reason.trim()).subscribe({
        next: () => {
          this.success = 'Demande de remboursement envoyée.';
          this.loadPayments();
        },
        error: () => this.error = 'La demande de remboursement a échoué.'
      });
    }
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadPayments();
    }
  }
}