import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/_services/common.service';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';

@Component({
  selector: 'app-tables-widget10',
  templateUrl: './tables-widget10.component.html',
})
export class TablesWidget10Component implements OnInit {
  lang:string='';
  membersData:any

  constructor(private common: CommonService, private _dashboard: DashboardService) {}
  ngOnInit(): void {
    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;
    const locationId = data.locationId;
    const periodCode = data.periodCode;
    
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang
    })

    this._dashboard.GetMemberStatistics(tenantId, locationId, periodCode).subscribe((res: any) => {

      this.membersData = res;

      console.log("aaaaaaaaaa", this.membersData);
    })
  }
}
