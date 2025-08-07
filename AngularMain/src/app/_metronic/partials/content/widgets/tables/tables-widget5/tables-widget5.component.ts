import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/_services/common.service';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';

type Tabs =
  | 'kt_table_widget_5_tab_1'
  | 'kt_table_widget_5_tab_2'
  | 'kt_table_widget_5_tab_3';

@Component({
  selector: 'app-tables-widget5',
  templateUrl: './tables-widget5.component.html',
})
export class TablesWidget5Component implements OnInit {
  lang:string='';
  newMembersData:any;
  constructor(private common: CommonService, private dashboard: DashboardService) {}

  activeTab: Tabs = 'kt_table_widget_5_tab_1';

  setTab(tab: Tabs) {
    this.activeTab = tab;

    if (this.activeTab  == "kt_table_widget_5_tab_1")
    {
      this.getNewMemberData(1);

    }
    if (this.activeTab  == "kt_table_widget_5_tab_2")
    {
      this.getNewMemberData(2);
      
    }
    if (this.activeTab  == "kt_table_widget_5_tab_3")
    {
      this.getNewMemberData(3);      
    }
  }

  activeClass(tab: Tabs) {
    return tab === this.activeTab ? 'show active' : '';
  }

  ngOnInit(): void {
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang
    })
   
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang
    })

    this.getNewMemberData(1);
  }

  getNewMemberData(type: number)
  {
    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;
    const locationId = data.locationId;

    this.dashboard.GetSubscriber(tenantId, locationId, type).subscribe((res: any) => {

      this.newMembersData = res;

      console.log("aaaaaaaaaa", this.newMembersData);
    })
  }
}
