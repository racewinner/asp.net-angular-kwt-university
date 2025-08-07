import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'year-month-selector',
  templateUrl: './year-month-selector.component.html',
})
export class YearAndMonthSelectorComponent implements OnInit {
  @Output() selected = new EventEmitter<{ year: number, month: number }>();
  @Output() close = new EventEmitter;
  @Input() buttonRef: ElementRef;
  @HostBinding('class') class =
    'menu menu-sub menu-sub-dropdown w-250px w-md-300px';
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'false';
  month: null;
  year: null;
  thisYear: number;
  thisMonth: number;
  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  years:any[] = [];
  disableSelect = new FormControl(false);
  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)
    && !this.buttonRef.nativeElement.contains(event.target)
    && !(document.getElementsByClassName('cdk-overlay-container').length && document.getElementsByClassName('cdk-overlay-container')[0].contains(event.target as Node))
  ) {
      this.onClose()
    }
  }

  ngOnInit(): void {
    this.initYears();
  }
  initYears() {
    const now = new Date();
    this.thisYear = now.getFullYear();
    this.thisMonth = now.getMonth();
    const minYear = this.thisYear -100;
    for(let i = this.thisYear; i>= minYear; i--){
      this.years.push(i)
    }
  }

  onSubmit() {
    if (this.year && this.month) {
      this.selected.emit({year:this.year, month:this.month})
    } else return;
  }
  onClose(){
    this.close.emit()
  }
}
