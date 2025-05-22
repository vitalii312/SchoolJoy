import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Badge, GraduationStats, Student } from '../../interfaces/graduation.interface';
import { ChartModule, Chart as AngularChart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="dashboard">
      <div class="top-bar">
        <h1>Dashboard</h1>
        <div class="top-actions">
          <div class="search-group">
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input type="search" placeholder="Search" class="search-input" />
            </div>
            <div class="groups-wrapper">
              <button class="groups-btn" (click)="toggleGroupsDropdown($event)">
                Groups
                <span class="caret">▾</span>
              </button>
              <div class="groups-dropdown" [class.show]="showGroupsDropdown">
                <div class="dropdown-header">
                  <span>Select Group</span>
                  <button class="close-btn" (click)="toggleGroupsDropdown($event)">✕</button>
                </div>
                <div class="dropdown-search">
                  <span class="search-icon">🔍</span>
                  <input type="search" placeholder="Search groups" [(ngModel)]="groupSearchTerm" />
                </div>
                <div class="groups-list">
                  <button 
                    *ngFor="let group of filteredGroups" 
                    class="group-item"
                    [class.active]="selectedGroup === group"
                    (click)="selectGroup(group)"
                  >
                    {{ group }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="badges-count">
            <fa-icon [icon]="badgeIcon" class="badge-icon"></fa-icon>
            <span>5 Badges</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="back-link">← Back</div>
        <div class="track-header">
          <h2>Graduation Track</h2>
          <div class="more-options-wrapper">
            <button class="more-options-btn" (click)="toggleMoreOptions($event)">⋮</button>
            <div class="more-options-dropdown" *ngIf="showMoreOptions">
              <button *ngFor="let option of moreOptions" 
                class="option-item"
                (click)="selectMoreOption(option)">
                {{ option }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="stats-container">
            <div class="donut-chart-wrapper">
              <h3>Track Completion</h3>
              <div class="chart-container">
                <div class="donut-chart">
                  <div [chart]="chart"></div>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <div class="legend-color not-started"></div>
                    <div class="legend-label">
                      <span class="status">Not Started</span>
                      <span class="stat-number">{{ legendStats['not_started'] }}</span>
                      <button class="dropdown-btn" (click)="toggleLegendDropdown('not_started', $event)">▾</button>
                      <div class="legend-dropdown" *ngIf="activeLegendDropdown === 'not_started'">
                        <button *ngFor="let action of legendActions" 
                          class="legend-action" 
                          (click)="selectLegendAction(action)">
                          {{ action }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color completed"></div>
                    <div class="legend-label">
                      <span class="status">Completed</span>
                      <span class="stat-number">{{ legendStats['completed'] }}</span>
                      <button class="dropdown-btn" (click)="toggleLegendDropdown('completed', $event)">▾</button>
                      <div class="legend-dropdown" *ngIf="activeLegendDropdown === 'completed'">
                        <button *ngFor="let action of legendActions" 
                          class="legend-action" 
                          (click)="selectLegendAction(action)">
                          {{ action }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color in-progress"></div>
                    <div class="legend-label">
                      <span class="status">In Progress</span>
                      <span class="stat-number">{{ legendStats['in_progress'] }}</span>
                      <button class="dropdown-btn" (click)="toggleLegendDropdown('in_progress', $event)">▾</button>
                      <div class="legend-dropdown" *ngIf="activeLegendDropdown === 'in_progress'">
                        <button *ngFor="let action of legendActions" 
                          class="legend-action" 
                          (click)="selectLegendAction(action)">
                          {{ action }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color at-risk"></div>
                    <div class="legend-label">
                      <span class="status">At Risk</span>
                      <span class="stat-number">{{ legendStats['at_risk'] }}</span>
                      <button class="dropdown-btn" (click)="toggleLegendDropdown('at_risk', $event)">▾</button>
                      <div class="legend-dropdown" *ngIf="activeLegendDropdown === 'at_risk'">
                        <button *ngFor="let action of legendActions" 
                          class="legend-action" 
                          (click)="selectLegendAction(action)">
                          {{ action }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalStudents }}</div>
                <p>Total Students Enrolled</p>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalBadges }}</div>
                <p>Badges</p>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.completionRate }}%</div>
                <p>Completion Rate</p>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.studentsAtRisk }}</div>
                <p>Students At Risk</p>
              </div>
            </div>
          </div>

          <div class="badges-section">
            <div class="section-header">
              <div class="tabs">
                <button class="tab" [class.active]="activeTab === 'badges'" (click)="setActiveTab('badges')">Badges</button>
                <button class="tab" [class.active]="activeTab === 'students'" (click)="setActiveTab('students')">Students</button>
              </div>
              <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input type="search" [placeholder]="'Search ' + activeTab" class="search-input" [(ngModel)]="searchTerm" />
              </div>
            </div>

            <table *ngIf="activeTab === 'badges'">
              <thead>
                <tr>
                  <th>Badge</th>
                  <th>Total Goals</th>
                  <th>Completed</th>
                  <th>In Progress</th>
                  <th>Not Started</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let badge of filteredBadges">
                  <td>
                    <div class="badge-info">
                      <span class="badge-icon">🚀</span>
                      {{ badge.title }}
                    </div>
                  </td>
                  <td>{{ badge.totalGoals }}</td>
                  <td>{{ badge.completed }}</td>
                  <td>{{ badge.inProgress }}</td>
                  <td>{{ badge.notStarted }}</td>
                  <td>
                    <div class="completion-rate">
                      <div class="progress-bar">
                        <div class="progress" [style.width]="badge.completionRate + '%'"></div>
                      </div>
                      <span class="rate-value">{{ badge.completionRate }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table *ngIf="activeTab === 'students'">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Badges Completed</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let student of filteredStudents">
                  <td>
                    <div class="student-info">
                      <span class="student-avatar">👤</span>
                      {{ student.name }}
                    </div>
                  </td>
                  <td>
                    <span [class]="'status-badge ' + student.status">
                      {{ student.status.replace('_', ' ') | titlecase }}
                    </span>
                  </td>
                  <td>4/5</td>
                  <td>
                    <div class="completion-rate">
                      <div class="progress-bar">
                        <div class="progress" [style.width]="'80%'"></div>
                      </div>
                      <span class="rate-value">80%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1.5rem;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .top-bar h1 {
      font-size: 1.25rem;
      color: #1e293b;
      margin: 0;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-group {
      display: flex;
      align-items: stretch;
    }

    .search-wrapper {
      position: relative;
    }

    .search-input {
      padding: 0.5rem 1rem;
      padding-left: 2.5rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      outline: none;
      min-width: 200px;
      height: 100%;
    }

    .top-bar .search-wrapper .search-input {
      border-right: none;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .groups-wrapper {
      height: 100%;
      position: relative;
    }

    .groups-btn {
      height: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0 4px 4px 0;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4b5563;
      min-width: 100px;
      justify-content: space-between;
    }

    .caret {
      color: #9ca3af;
    }

    .badges-count {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border-radius: 4px;
      color: #4b5563;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-icon {
      color: #2563eb;
      font-size: 1rem;
    }

    .main-content {
      padding: 0 0.5rem;
    }

    .back-link {
      color: #6b7280;
      margin-bottom: 1rem;
      cursor: pointer;
    }

    h2 {
      font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 1.5rem;
    }

    h3 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .chart-legend {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-width: 180px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      white-space: nowrap;
    }

    .legend-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      position: relative;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.not-started { background-color: #64748b; }
    .legend-color.completed { background-color: #22c55e; }
    .legend-color.in-progress { background-color: #f59e0b; }
    .legend-color.at-risk { background-color: #ef4444; }

    .status {
      flex: 1;
      color: #4b5563;
    }

    .help-icon {
      color: #9ca3af;
      font-size: 0.875rem;
      cursor: help;
    }

    .help-icon:hover {
      color: #6b7280;
    }

    .dropdown-btn {
      padding: 0.25rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      transition: color 0.2s;
    }

    .dropdown-btn:hover {
      color: #6b7280;
    }

    .tooltip {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      white-space: nowrap;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tooltip::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid #1e293b;
    }

    .legend-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      min-width: 160px;
      z-index: 10;
      margin-top: 0.5rem;
      padding: 0.25rem 0;
    }

    .legend-action {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      text-align: left;
      border: none;
      background: none;
      color: #4b5563;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .legend-action:first-child {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    .legend-action:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    .legend-action:hover {
      background: #f3f4f6;
    }

    .stats-container {
      display: grid;
      grid-template-columns: 650px 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .donut-chart-wrapper {
      padding: 2rem;
      background: #f8f9fa;
      width: 100%;
    }

    .donut-chart-wrapper h3 {
      margin-bottom: 1.5rem;
      color: #1e293b;
      font-size: 1rem;
      font-weight: 500;
    }

    .chart-container {
      display: flex;
      gap: 4rem;
      align-items: flex-start;
    }

    .donut-chart {
      width: 300px;
      height: 300px;
      position: relative;
      flex-shrink: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .stat-card p {
      margin: 0;
      color: #6b7280;
    }

    .badges-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .tabs {
      display: flex;
      gap: 1rem;
    }

    .tab {
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      cursor: pointer;
      color: #6b7280;
      position: relative;
    }

    .tab.active {
      color: #2563eb;
    }

    .tab.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: #2563eb;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    th {
      color: #6b7280;
      font-weight: 500;
    }

    .badge-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .badge-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 6px;
    }

    .completion-rate {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .progress {
      position: absolute;
      height: 100%;
      background: #2563eb;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .rate-value {
      min-width: 45px;
      color: #6b7280;
    }

    .student-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .student-avatar {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 50%;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
    }

    .status-badge.completed {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.in_progress {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.not_started {
      background: #f1f5f9;
      color: #475569;
    }

    .status-badge.at_risk {
      background: #fee2e2;
      color: #991b1b;
    }

    .groups-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      width: 240px;
      display: none;
      z-index: 10;
    }

    .groups-dropdown.show {
      display: block;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .dropdown-header span {
      font-weight: 500;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
    }

    .dropdown-search {
      padding: 0.75rem;
      position: relative;
      border-bottom: 1px solid #e5e7eb;
    }

    .dropdown-search input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      padding-left: 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      outline: none;
    }

    .dropdown-search .search-icon {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .groups-list {
      max-height: 240px;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .group-item {
      width: 100%;
      padding: 0.5rem 0.75rem;
      text-align: left;
      background: none;
      border: none;
      border-radius: 4px;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
    }

    .group-item:hover {
      background: #f3f4f6;
    }

    .group-item.active {
      background: #e0e7ff;
      color: #4f46e5;
    }

    .track-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .track-header h2 {
      margin: 0;
    }

    .more-options-wrapper {
      position: relative;
    }

    .more-options-btn {
      background: none;
      border: 1px solid grey;
      border-radius: 4px;
      font-size: 1.5rem;
      color: #6b7280;
      padding: 0.5rem 1.25rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .more-options-btn:hover {
      color: #4b5563;
    }

    .more-options-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      min-width: 160px;
      z-index: 10;
      margin-top: 0.5rem;
      padding: 0.25rem 0;
    }

    .option-item {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      text-align: left;
      border: none;
      background: none;
      color: #4b5563;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .option-item:first-child {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    .option-item:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    .option-item:hover {
      background: #f3f4f6;
    }

    .stat-number {
      color: #6b7280;
      font-size: 0.875rem;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: GraduationStats = {
    totalStudents: 50,
    totalBadges: 5,
    completionRate: 68,
    studentsAtRisk: 5
  };

  badges: Badge[] = [
    {
      id: 1,
      title: 'Badge Title',
      totalGoals: 5,
      completed: 4,
      inProgress: 1,
      notStarted: 0,
      completionRate: 73
    },
    {
      id: 2,
      title: 'Badge Title',
      totalGoals: 5,
      completed: 4,
      inProgress: 1,
      notStarted: 0,
      completionRate: 73
    },
    {
      id: 3,
      title: 'Badge Title',
      totalGoals: 5,
      completed: 4,
      inProgress: 1,
      notStarted: 0,
      completionRate: 73
    },
    {
      id: 4,
      title: 'Badge Title',
      totalGoals: 5,
      completed: 4,
      inProgress: 1,
      notStarted: 0,
      completionRate: 73
    }
  ];

  chart = new AngularChart({
    chart: {
      type: 'pie',
      plotShadow: false,
      height: 300,
      width: 300,
      marginRight: 0,
      backgroundColor: 'transparent'
    },
    credits: {
      enabled: false
    },
    title: {
      text: '50',
      align: 'center',
      verticalAlign: 'middle',
      y: -10,
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    },
    subtitle: {
      text: 'Total Students',
      align: 'center',
      verticalAlign: 'middle',
      y: 10,
      style: {
        fontSize: '12px',
        color: '#64748b'
      }
    },
    plotOptions: {
      pie: {
        innerSize: '75%',
        dataLabels: {
          enabled: false
        },
        showInLegend: false,
        size: '100%',
        states: {
          hover: {
            enabled: false
          }
        }
      }
    },
    series: [{
      type: 'pie',
      data: [
        {
          name: 'Completed',
          y: 30,
          color: '#22c55e'
        },
        {
          name: 'In Progress',
          y: 15,
          color: '#f59e0b'
        },
        {
          name: 'Not Started',
          y: 3,
          color: '#64748b'
        },
        {
          name: 'At Risk',
          y: 2,
          color: '#ef4444'
        }
      ]
    }]
  });

  activeTab: 'badges' | 'students' = 'badges';
  searchTerm = '';

  students: Student[] = [
    {
      id: 1,
      name: 'John Smith',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      status: 'in_progress'
    },
    {
      id: 3,
      name: 'Michael Brown',
      status: 'not_started'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      status: 'at_risk'
    }
  ];

  showGroupsDropdown = false;
  groupSearchTerm = '';
  selectedGroup: string | null = null;
  groups = [
    'All Groups',
    'Engineering Students',
    'Medical Students',
    'Business Students',
    'Art Students',
    'Science Students',
    'Law Students'
  ];

  activeTooltip: string | null = null;
  activeLegendDropdown: string | null = null;

  legendInfo = {
    'not_started': 'Students who have not begun their graduation track',
    'completed': 'Students who have finished all requirements',
    'in_progress': 'Students actively working on requirements',
    'at_risk': 'Students who may need additional support'
  };

  legendActions = [
    'View Details',
    'Export Data',
    'Set Reminder'
  ];

  showMoreOptions = false;
  moreOptions = [
    'Export Data',
    'Print Report',
    'Share Track',
  ];

  legendStats = {
    'not_started': 7,
    'completed': 7,
    'in_progress': 7,
    'at_risk': 7
  };

  badgeIcon = faMedal;

  get filteredBadges(): Badge[] {
    if (!this.searchTerm) return this.badges;
    const term = this.searchTerm.toLowerCase();
    return this.badges.filter(badge => 
      badge.title.toLowerCase().includes(term)
    );
  }

  get filteredStudents(): Student[] {
    if (!this.searchTerm) return this.students;
    const term = this.searchTerm.toLowerCase();
    return this.students.filter(student => 
      student.name.toLowerCase().includes(term) ||
      student.status.replace('_', ' ').toLowerCase().includes(term)
    );
  }

  get filteredGroups(): string[] {
    if (!this.groupSearchTerm) return this.groups;
    const term = this.groupSearchTerm.toLowerCase();
    return this.groups.filter(group => 
      group.toLowerCase().includes(term)
    );
  }

  setActiveTab(tab: 'badges' | 'students') {
    this.activeTab = tab;
    this.searchTerm = ''; // Reset search when switching tabs
  }

  toggleGroupsDropdown(event: Event) {
    event.stopPropagation();
    this.showGroupsDropdown = !this.showGroupsDropdown;

    // Add click outside listener when opening dropdown
    if (this.showGroupsDropdown) {
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown);
      });
    } else {
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  closeDropdown = (event: MouseEvent) => {
    // Check if the click is inside the dropdown
    const dropdown = document.querySelector('.groups-dropdown');
    if (dropdown && (dropdown === event.target || dropdown.contains(event.target as Node))) {
      return;
    }
    this.showGroupsDropdown = false;
    document.removeEventListener('click', this.closeDropdown);
  }

  selectGroup(group: string) {
    this.selectedGroup = group;
    this.showGroupsDropdown = false;
    document.removeEventListener('click', this.closeDropdown);
  }

  showTooltip(status: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeTooltip = status;
  }

  hideTooltip() {
    this.activeTooltip = null;
  }

  toggleLegendDropdown(status: string, event: Event) {
    event.stopPropagation();
    this.activeLegendDropdown = this.activeLegendDropdown === status ? null : status;
  }

  selectLegendAction(action: string) {
    console.log(`Selected action: ${action}`);
    this.activeLegendDropdown = null;
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    this.activeLegendDropdown = null;
  }

  toggleMoreOptions(event: Event) {
    event.stopPropagation();
    this.showMoreOptions = !this.showMoreOptions;
  }

  selectMoreOption(option: string) {
    console.log(`Selected option: ${option}`);
    this.showMoreOptions = false;
  }

  ngOnInit() {
    // Chart is already initialized in the property declaration
    document.addEventListener('click', () => {
      this.activeTooltip = null;
      this.activeLegendDropdown = null;
    });
  }

  ngOnDestroy() {
    // Cleanup
    document.removeEventListener('click', this.closeDropdown);
  }
} 