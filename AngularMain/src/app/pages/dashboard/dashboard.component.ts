import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { LocalizationService } from 'src/app/modules/_services/localization.service';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  /*********************/
  AppFormLabels$: Observable<FormTitleHd[]>;
  AppFormLabels: FormTitleHd[] = [];
  lang: any;
  /*********************/
  menuHeading: any[] = [];

  employeePerformanceDashBoardModel: any;
  latestSubscriberDashBoardModel: any;
  membersStatisticsDashBoardModel: any;
  newMembersDashBoardModel: any;
  newSubscriberDashBoardModel: any;
  toDoDashBoardModels: any;
  servicePercents: any;
  loanVSReceive: any;

  constructor(private localizationService: LocalizationService, private _dashboardService: DashboardService) { }

  ngOnInit(): void {
    //Set default lanauge to en (English) If not exists
    if (localStorage.getItem("lang") === null) {
      localStorage.setItem('lang', 'en');
      localStorage.setItem('langType', '1');
    }
    // 
    if (localStorage.getItem('AppLabels') === null) {
      this.lang = localStorage.getItem('lang');
      // Get form body labels 
      this.AppFormLabels$ = this.localizationService.getAppLabels()
      // Get observable as normal array of items
      this.AppFormLabels$.subscribe({
        next: data => {
          this.AppFormLabels = data;
          localStorage.setItem('AppLabels', JSON.stringify(this.AppFormLabels));
        },
        error: error => {
          console.log(error);
        },
        complete: () => {
          console.log('Request completed');
        }
      })
    }
    this.getAllDashboardData()
    //
    // this.menuHeading= JSON.parse(localStorage.getItem('userMenu')!);
    // console.log('dasboard',this.menuHeading);

  }
  
  getAllDashboardData () {
    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;
    const locationId = data.locationId;
    const periodCode = data.periodCode;

    this._dashboardService.GetDashBoardData(tenantId, locationId).subscribe((res: any) => {
      this.employeePerformanceDashBoardModel = res.employeePerformanceDashBoardModel;
      this.latestSubscriberDashBoardModel = res.latestSubscriberDashBoardModel;
      this.newMembersDashBoardModel = res.newMembersDashBoardModel;
      this.newSubscriberDashBoardModel = res.newSubscriberDashBoardModel;
      this.toDoDashBoardModels = res.toDoDashBoardModels;
    })

    // setTimeout(() => {
    //   this.getAllDashboardData()
    // }, 60000)
  }

  getNewSubscriberDatabyYearMonth(date:string) {
    console.log('getNewSubscriber', date)
    // var data = JSON.parse(localStorage.getItem("user")!);
    // const tenantId = data.tenantId;
    // const locationId = data.locationId;
    // this._dashboardService.GetNewSubscripberDashboardModel(tenantId, locationId, date).subscribe((res: any) => {
    //   this.newSubscriberDashBoardModel = res.newSubscriberDashBoardModel;
    // })
  }
}

