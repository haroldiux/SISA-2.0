import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';

/**
 * Pedagogical moments duration counter component verifying exact duration sums (e.g. 180m).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-duration-counter',
  templateUrl: './scu-duration-counter.component.html',
  styleUrls: ['./scu-duration-counter.component.scss']
})
export class ScuDurationCounterComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public inicioMin: number = 0;
  @Input() public desarrolloMin: number = 0;
  @Input() public cierreMin: number = 0;
  @Input() public targetDurationMin: number = 180;

  public currentSum: number = 0;
  public isValid: boolean = false;
  public difference: number = 0;

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnChanges(): void {
    this._calculateSum();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    this._calculateSum();
  }

  private _finalize(): void {
    // Cleanup
  }

  private _calculateSum(): void {
    this.currentSum = (Number(this.inicioMin) || 0) + (Number(this.desarrolloMin) || 0) + (Number(this.cierreMin) || 0);
    this.isValid = (this.currentSum === Number(this.targetDurationMin));
    this.difference = this.currentSum - Number(this.targetDurationMin);
  }
}
