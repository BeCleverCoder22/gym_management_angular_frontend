import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer';


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

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.loading = false;
      }
    });
  }

  searchCustomers(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.customerService.searchByName(this.searchTerm).subscribe({
        next: (data) => {
          this.customers = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
          this.loading = false;
        }
      });
    } else {
      this.loadCustomers();
    }
  }

  deleteCustomer(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
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