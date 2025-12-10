import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/solar-system/solar-system.component').then(
        (m) => m.SolarSystemComponent
      ),
  },
];
