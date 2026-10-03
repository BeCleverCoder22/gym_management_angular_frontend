import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: false,
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEdit = false;
  customerId?: number;
  loading = false;
  activeSubscription: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.fb.group({
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(25), Validators.pattern(/^[0-9+() .-]+$/)]]
    });
  }

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.customerId) {
      this.isEdit = true;
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    this.loading = true;
    this.customerService.getById(this.customerId!).subscribe({
      next: (customer) => {
        this.customerForm.patchValue(customer);
        this.activeSubscription = customer.activeSubscription;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du client:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.loading = true;
      const customer = this.customerForm.value;
      
      const request = this.isEdit
        ? this.customerService.update(this.customerId!, customer)
        : this.customerService.create(customer);

      request.subscribe({
        next: () => {
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.loading = false;
        }
      });
    }
  }
}