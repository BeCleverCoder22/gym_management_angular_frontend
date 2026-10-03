// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CustomerListComponent } from './components/customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customers/customer-form/customer-form.component';
import { PackListComponent } from './components/packs/pack-list/pack-list.component';
import { PackFormComponent } from './components/packs/pack-form/pack-form.component';
import { SubscriptionListComponent } from './components/subscriptions/subscription-list/subscription-list.component';
import { SubscriptionFormComponent } from './components/subscriptions/subscription-form/subscription-form.component';
import { StatisticsComponent } from './components/dashboard/statistics/statistics.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserFormComponent } from './components/users/user-form/user-form.component';
import { AdminGuard } from './guards/admin.guard';
import { PaymentPageComponent } from './components/payments/payment-page.component';
import { AdminOperationsComponent } from './components/admin/admin-operations.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StatisticsComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'customers/new', component: CustomerFormComponent },
      { path: 'customers/edit/:id', component: CustomerFormComponent },
      { path: 'packs', component: PackListComponent },
      { path: 'packs/new', component: PackFormComponent, canActivate: [AdminGuard] },
      { path: 'packs/edit/:id', component: PackFormComponent, canActivate: [AdminGuard] },
      { path: 'subscriptions', component: SubscriptionListComponent },
      { path: 'subscriptions/new', component: SubscriptionFormComponent },
      { path: 'subscriptions/edit/:id', component: SubscriptionFormComponent },
      { path: 'payments', component: PaymentPageComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'users', component: UserListComponent, canActivate: [AdminGuard] },
      { path: 'users/new', component: UserFormComponent, canActivate: [AdminGuard] },
      { path: 'users/edit/:id', component: UserFormComponent, canActivate: [AdminGuard] },
      { path: 'audit', component: AdminOperationsComponent, canActivate: [AdminGuard], data: { view: 'audit' } },
      { path: 'notifications', component: AdminOperationsComponent, canActivate: [AdminGuard], data: { view: 'notifications' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }