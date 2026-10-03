import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { StatisticsService } from '../../../services/statistics.service';
import { DashboardStatistics } from '../../../services/statistics.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  packDistribution: { packName: string; count: number }[] = [];
  hasPackDistribution = false;
  statistics: DashboardStatistics = {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    subscriptionsDue: 0,
    subscriptionsSoldThisMonth: 0,
    estimatedMonthlyRevenue: 0,
    packDistribution: []
  };
  loading = true;
  error = '';
  exportForm: FormGroup;
  exporting = false;
  exportSuccess = false;

  constructor(
    private statisticsService: StatisticsService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {
    this.exportForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = '';
    this.statisticsService.getStatistics().pipe(
      finalize(() => {
        this.loading = false;
        if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.statistics = data;
        this.packDistribution = Array.isArray(data?.packDistribution) ? data.packDistribution : [];
        this.hasPackDistribution = this.packDistribution.length > 0;
      },
      error: () => {
        this.error = 'Impossible de charger les statistiques. Vérifiez le backend et réessayez.';
      }
    });
  }

  exportSubscriptions(): void {
    if (this.exportForm.valid) {
      this.exporting = true;
      this.exportSuccess = false;
      const { startDate, endDate } = this.exportForm.value;

      this.statisticsService.exportSubscriptions(startDate, endDate)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `abonnements_${startDate}_${endDate}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
            this.exporting = false;
            this.exportSuccess = true;
          },
          error: () => {
            this.error = "Erreur lors de l'exportation des données";
            this.exporting = false;
          }
        });
    }
  }
}
