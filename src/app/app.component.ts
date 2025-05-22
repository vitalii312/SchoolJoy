import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export interface Badge {
  id: number;
  name: string;
  description: string;
  progress: number;
  icon: string;
  category: string;
  earnedDate?: Date;
}

export interface GraduationStats {
  totalStudents: number;
  graduated: number;
  inProgress: number;
  pending: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardComponent],
  template: `
    <app-dashboard></app-dashboard>
  `,
  styles: []
})
export class AppComponent {}