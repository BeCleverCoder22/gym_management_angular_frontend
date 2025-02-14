import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  passwordError = '';
  passwordSuccess = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      username: [{value: '', disabled: true}],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
      }
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      this.userService.updateProfile(this.profileForm.get('email')?.value).subscribe({
        next: () => {
          this.success = 'Profil mis à jour avec succès';
          this.loading = false;
        },
        error: () => {
          this.error = 'Erreur lors de la mise à jour du profil';
          this.loading = false;
        }
      });
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.passwordError = '';
      this.passwordSuccess = '';

      const { oldPassword, newPassword } = this.passwordForm.value;
      
      this.userService.changePassword(oldPassword, newPassword).subscribe({
        next: () => {
          this.passwordSuccess = 'Mot de passe modifié avec succès';
          this.passwordForm.reset();
          this.loading = false;
        },
        error: (error) => {
          this.passwordError = error?.error?.message || 'Erreur lors du changement de mot de passe';
          this.loading = false;
        }
      });
    }
  }
}