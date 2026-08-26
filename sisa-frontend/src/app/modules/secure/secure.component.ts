import { Component, OnInit, OnDestroy } from '@angular/core';

/**
 * Secure Shell wrapper component rendering layout shell.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-secure-root',
  template: '<scu-layout-shell></scu-layout-shell>'
})
export class SecureComponent implements OnInit, OnDestroy {

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    // Shell initialization
  }

  private _finalize(): void {
    // Shell cleanup
  }
}
