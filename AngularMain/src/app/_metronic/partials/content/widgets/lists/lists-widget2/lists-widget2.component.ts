import { Component, Input } from '@angular/core';
import { CommonService } from 'src/app/modules/_services/common.service';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';

@Component({
  selector: 'app-lists-widget2',
  templateUrl: './lists-widget2.component.html',
})
export class ListsWidget2Component {
  lang:string='';
  latestSubscriberData:any;
  constructor(private common: CommonService, private dasboard: DashboardService) {}

  ngOnInit(){
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang
    })
    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;
    const locationId = data.locationId;
    
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang
    })

    this.dasboard.GetLatestSubscriber(tenantId, locationId).subscribe((res: any) => {

      this.latestSubscriberData = res;
    })      
  }
}
