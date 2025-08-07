import { Component, Input } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';
import { EmployeePerformanceData, EmployeePerformanceDetail } from 'src/app/modules/models/Dashboard/DashboardDto';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lists-widget6',
  templateUrl: './lists-widget6.component.html',
  styleUrls: ['./lists-widget6.scss'],
  providers: [DatePipe]
})
export class ListsWidget6Component {
  employeePerformanceData: EmployeePerformanceData
  employeePerformanceDetail: Array <EmployeePerformanceDetail>
  closeResult: string = '';
  constructor(private modalService: NgbModal, private _dashboardService: DashboardService, private datePipe: DatePipe) {}

  ngOnInit(){

    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;

    this._dashboardService.GetEmployeePerformance(tenantId).subscribe((response:any)=>{
      this.employeePerformanceData = response    
    });

    this._dashboardService.GetEmployeePerformanceDetail(tenantId).subscribe((response: any) => {
      this.employeePerformanceDetail = response.map((item: EmployeePerformanceDetail) => {
        // Format the date in 'yy-MM-dd HH:mm' format
        item.dateFormatted = this.datePipe.transform(item.asOfDate, 'yy-MM-dd HH:mm');
        return item;
      });

      console.log('employeePerformanceDetail::', this.employeePerformanceDetail);
    });
  }

  open(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',modalDialogClass:'modal-md'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  } 
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
