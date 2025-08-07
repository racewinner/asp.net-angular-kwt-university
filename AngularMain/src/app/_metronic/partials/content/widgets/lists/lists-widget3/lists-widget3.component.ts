import { Component, Input } from '@angular/core';
import { formatDate } from 'src/app/utils/general';

@Component({
  selector: 'app-lists-widget3',
  templateUrl: './lists-widget3.component.html',
})
export class ListsWidget3Component {
  @Input() todoData:any;
  constructor() {}
  onFormatTime(datetime:any) {
    return formatDate(new Date(datetime), false);
  }
}
