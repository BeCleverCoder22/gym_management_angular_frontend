import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZone: 'zone.js',
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
