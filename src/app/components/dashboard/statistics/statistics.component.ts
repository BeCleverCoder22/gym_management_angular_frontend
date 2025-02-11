import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../../services/statistics.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  statistics = {
    totalActiveCustomers: 0,
    monthlyRevenue: 0,
    startDate: '',
    endDate: '' 
  };
  loading = true;
  error = '';
  exportForm: FormGroup;
  exporting = false;
  exportSuccess = false;

  constructor(
    private statisticsService: StatisticsService,
    private fb: FormBuilder
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
    this.statisticsService.getStatistics().subscribe({
      next: (data) => {
        this.statistics.totalActiveCustomers = data.totalActiveCustomers;
        this.statistics.monthlyRevenue = data.monthlyRevenue;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  exportSubscriptions(): void {
    if (this.exportForm.valid) {
      this.exporting = true;
      this.exportSuccess = false;
      const { startDate, endDate } = this.exportForm.value;

      this.statisticsService.exportSubscriptions(new Date(startDate), new Date(endDate))
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
