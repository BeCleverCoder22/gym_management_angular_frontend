import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PackService } from '../../../services/pack.service';
import { Pack } from '../../../models/pack';

@Component({
  selector: 'app-pack-form',
  standalone: false,
  templateUrl: './pack-form.component.html',
  styleUrls: ['./pack-form.component.css']
})
export class PackFormComponent implements OnInit {
  packForm: FormGroup;
  isEditing: boolean = false;
  packId?: number;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private packService: PackService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.packForm = this.fb.group({
      offerName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      monthlyPrice: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.packId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.packId) {
      this.isEditing = true;
      this.loadPack();
    }
  }

  loadPack(): void {
    if (this.packId) {
      this.loading = true;
      this.packService.getById(this.packId).subscribe({
        next: (pack) => {
          this.packForm.patchValue(pack);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement de l\'offre';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.packForm.valid) {
      this.loading = true;
      const pack: Pack = this.packForm.value;

      const action = this.isEditing
        ? this.packService.update(this.packId!, pack)
        : this.packService.create(pack);

      action.subscribe({
        next: () => {
          this.router.navigate(['/packs']);
        },
        error: (error) => {
          this.error = 'Erreur lors de l\'enregistrement de l\'offre';
          this.loading = false;
        }
      });
    }
  }
}