import { Component, AfterViewInit } from '@angular/core';

declare const lucide: any;

/**
 * Root Application Component hosting SISA multi-role enterprise workspace.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  public ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  public onDocenteSelectorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (!select) return;
    const ci = select.value;
    if (typeof (window as any).onDocenteSelectorChange === 'function') {
      (window as any).onDocenteSelectorChange(ci);
    } else if (typeof (window as any).selectDocenteFromApi === 'function') {
      (window as any).selectDocenteFromApi(ci, false);
    }
  }
}
