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
    // Ensure active view, subject, and document tab are restored immediately after Angular renders the template into DOM
    setTimeout(() => {
      if (typeof (window as any).checkInitialAuth === 'function') {
        (window as any).checkInitialAuth();
      }
    }, 20);
  }

  public onDocenteSelectorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (!select) return;
    const ci = select.value;
    if (typeof (window as any).selectDocenteFromApi === 'function') {
      (window as any).selectDocenteFromApi(ci, false);
    } else if (typeof (window as any).onDocenteSelectorChange === 'function') {
      (window as any).onDocenteSelectorChange(ci);
    }
  }

  public onSessionSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select && typeof (window as any).onAttendanceSessionSelect === 'function') {
      (window as any).onAttendanceSessionSelect(select.value, select.selectedIndex);
    }
  }

  public handlePasswordSubmit(event: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (typeof (window as any).handleForcedPasswordSubmit === 'function') {
      (window as any).handleForcedPasswordSubmit(event);
    }
  }
}
