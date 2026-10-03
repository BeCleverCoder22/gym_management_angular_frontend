import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer';
import { finalize } from 'rxjs';
import { normalizePageResponse } from '../../../models/api';


@Component({
  selector: 'app-customer-list',
  standalone: false,
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  searchTerm = '';
  lastNameFilter = '';
  phoneFilter = '';
  error = '';
  page = 0;
  readonly size = 20;
  totalPages = 0;
  sort = 'registrationDate,desc';

  constructor(
    private customerService: CustomerService,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = '';
    this.customerService.getAll({
      page: this.page,
      size: this.size,
      sort: this.sort,
      q: this.searchTerm.trim() || undefined,
      lastName: this.lastNameFilter.trim() || undefined,
      phone: this.phoneFilter.trim() || undefined
    }).pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        const page = normalizePageResponse<Customer>(data);
        this.customers = page.content;
        this.totalPages = page.totalPages;
      },
      error: () => {
        this.error = 'Impossible de charger les clients. Vérifiez le backend et réessayez.';
      }
    });
  }

  searchCustomers(): void {
    this.page = 0;
    this.loadCustomers();
  }

  changeSort(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadCustomers();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadCustomers();
    }
  }

  deleteCustomer(id: number): void {
    if (confirm('Désactiver ce client ? Cette action conserve son historique.')) {
      this.customerService.delete(id).subscribe({
        next: () => {
          this.customers = this.customers.filter(customer => customer.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}