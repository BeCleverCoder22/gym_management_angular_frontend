import { Component, OnInit } from '@angular/core';
import { PackService } from '../../../services/pack.service';
import { Pack } from '../../../models/pack';


@Component({
  selector: 'app-pack-list',
  standalone: false,
  templateUrl: './pack-list.component.html',
  styleUrls: ['./pack-list.component.css']
})
export class PackListComponent implements OnInit {
  packs: Pack[] = [];
  loading = false;

  constructor(private packService: PackService) {}

  ngOnInit(): void {
    this.loadPacks();
  }

  loadPacks(): void {
    this.loading = true;
    this.packService.getAll().subscribe({
      next: (data) => {
        this.packs = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des offres:', error);
        this.loading = false;
      }
    });
  }

  deletePack(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.packService.delete(id).subscribe({
        next: () => {
          this.packs = this.packs.filter(pack => pack.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}