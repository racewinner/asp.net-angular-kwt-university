import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/modules/_services/common.service';
import { formatDate } from 'src/app/utils/general';

@Component({
  selector: 'app-lists-widget5',
  templateUrl: './lists-widget5.component.html',
})
export class ListsWidget5Component {
  @Output() getNewSubscriberDatabyYearMonth = new EventEmitter<string>();
  @ViewChild('toggleYearMonthSelectButton', {static: true}) buttonRef: ElementRef;
  @Input() newSubscriberDashBoardModel:any;
  lang:string='';
  isShowYearMonthSelection: boolean = false;
  fullTextMonth = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12'
  ]
  constructor(private common: CommonService) {}


  ngOnInit(): void {
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang
    })
  }
  
  toggleDropdown () {
    this.isShowYearMonthSelection = !this.isShowYearMonthSelection;
  }
  onMonthYearSelect(eventData: { year: number, month: number }){
    this.getNewSubscriberDatabyYearMonth.emit(eventData.year + this.fullTextMonth[eventData.month]);
    this.isShowYearMonthSelection = false;
  }
  onFormatTime(datetime:any) {
    return formatDate(new Date(datetime), false);
  }
}
