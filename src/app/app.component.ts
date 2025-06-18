import { Component, ElementRef, ViewChild, inject , Injectable} from '@angular/core';
import { MatButtonModule} from '@angular/material/button';

import { CommonModule } from '@angular/common';

import { MatListModule ,MatSelectionListChange} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinner} from '@angular/material/progress-spinner'
import { ViewEncapsulation } from '@angular/core';
import { Award } from './model/Award';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MatCardModule} from '@angular/material/card'


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatListModule, CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, HttpClientModule, MatProgressBarModule, MatProgressSpinner, MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

  encapsulation: ViewEncapsulation.None  // <-- add this
})
export class AppComponent {
  constructor(private http: HttpClient) {
    this.loadAwards();
  }
  
  title = 'awards-ui';
  isLoading = false;


  @ViewChild('awardImage') awardImageRef!: ElementRef<HTMLImageElement>;

  // allAwards = [
  //   { id: 1, name: 'Army Service Ribbon' },
  //   { id: 2, name: 'National Defense Service Medal' },
  //   { id: 3, name: 'Global War on Terrorism Service Medal' },
  //   { id: 4, name: 'Overseas Service Ribbon' },
  //   { id: 5, name: 'Armed Forces Expeditionary Medal' },
  // ];

  // selectedAwards: { id: number; name: string }[] = [];

  // Transfer state
  allAwards: Award[] = [];
  availableAwards = [...this.allAwards];
  selectedAwards: any[] = [];

  selectedAvailable: Award[] = [];
  selectedSelected: Award[] = [];

  loadAwards() {
    console.log("loadAwards called");
    this.isLoading = true;
    this.http.get<Award[]>(`${environment.apiUrl}/getAwardsList`)
      .subscribe({
        next: data => {
          console.info(data);
          this.allAwards = data;
          this.availableAwards = [...this.allAwards];
          this.isLoading = false;
        },
        error: err => console.error('Failed to load awards', err)
      });
  }

  get sortedAvailableAwards() {
    return this.availableAwards.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

onAvailableSelectionChange(event: MatSelectionListChange) {
  this.selectedAvailable = event.source.selectedOptions.selected.map(opt => opt.value);
}

onSelectedSelectionChange(event: MatSelectionListChange) {
  this.selectedSelected = event.source.selectedOptions.selected.map(opt => opt.value);

  
}

moveToSelected() {
  this.selectedAvailable.forEach(award => {
    this.selectedAwards.push(award);
    this.availableAwards = this.availableAwards.filter(a => a !== award);
  });
  this.selectedAvailable = [];
}

moveToAvailable() {
  this.selectedSelected.forEach(award => {
    this.availableAwards.push(award);
    this.selectedAwards = this.selectedAwards.filter(a => a !== award);
  });
  this.selectedSelected = [];
}

  getCombinedAward() {
    this.isLoading = true;
    const ids = this.selectedAwards.map(a => a.id);
    console.log("getCombinedAward selectedIds: " + ids);
    this.http.post(`${environment.apiUrl}/combine-awards`, { awardIds: ids }, { responseType: 'blob' })
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          this.awardImageRef.nativeElement.src = url;
          this.isLoading = false;
        },
        error: err => console.error('Error generating image:', err)
      });
  }

  toggleAvailable(award: Award) {
    const index = this.selectedAvailable.indexOf(award);
    if (index >= 0) {
      this.selectedAvailable.splice(index, 1);
    } else {
      this.selectedAvailable.push(award);
    }
  }
  
  toggleSelected(award: Award) {
    const index = this.selectedSelected.indexOf(award);
    if (index >= 0) {
      this.selectedSelected.splice(index, 1);
    } else {
      this.selectedSelected.push(award);
    }
  }
  
}



