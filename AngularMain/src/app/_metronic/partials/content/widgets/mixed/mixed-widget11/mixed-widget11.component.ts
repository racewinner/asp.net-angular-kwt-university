import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { getCSSVariableValue } from '../../../../../kt/_utils';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';
import { dashboardLoanVSReceived } from 'src/app/modules/models/Dashboard/DashboardDto';

@Component({
  selector: 'app-mixed-widget11',
  templateUrl: './mixed-widget11.component.html',
})
export class MixedWidget11Component implements OnInit {
  @Input() chartColor: string = '';
  @Input() chartHeight: string;
  @Input() loanVSReceive: any;
  LoanAmt: number;
  ReceivedAmt: number;
  lang: any = '';
  chartOptions: any = {};
  dashboardResponseDto: dashboardLoanVSReceived;

  listLoanAmt: number[] = [];
  listReceivedAmt: number[] = [];
  listTotalPeriodCode: string[] = [];

  constructor(private _commonService:DashboardService) {
    this.dashboardResponseDto;
    this.LoanAmt = 0;
    this.ReceivedAmt = 0;
   }

  ngOnInit(): void {
    this.getDashboardLoanVSReceived();
    this.lang = localStorage.getItem('lang');
  }
  
  getDashboardLoanVSReceived()
  {
      var data = JSON.parse(localStorage.getItem("user")!);
      const tenantId = data.tenantId;

      this._commonService.GetLoanVsRecive(tenantId).subscribe((response:any)=>{
        
        this.dashboardResponseDto = response;

        console.log("getDashboardTotalEmployees", this.dashboardResponseDto);

        this.LoanAmt = this.dashboardResponseDto.totalLoanAmt;
        this.ReceivedAmt = this.dashboardResponseDto.totalReceivedAmt;

        this.chartOptions = this.getChartOptions(this.chartHeight, this.chartColor);
      });
  }

  getChartOptions(chartHeight: string, chartColor: string) {
    const labelColor = getCSSVariableValue('--bs-gray-500');
    const borderColor = getCSSVariableValue('--bs-gray-200');
    const secondaryColor = getCSSVariableValue('--bs-gray-300');
    const baseColor = getCSSVariableValue('--bs-' + chartColor);
  
    for (const graphData of this.dashboardResponseDto.graphData) {
      if (graphData.periodCode !== null) {
        this.listTotalPeriodCode.push(graphData.periodCode);
        this.listLoanAmt.push(graphData.loanAmt);
        this.listReceivedAmt.push(graphData.receivedAmt);
      }
    }

    return {
      series: [
        {
          name: 'LoanAmt',
          data: this.listLoanAmt,
        },
        {
          name: 'ReceivedAmt',
          data: this.listReceivedAmt,
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: chartHeight,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 5,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: this.listTotalPeriodCode,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
      },
      fill: {
        type: 'solid',
      },
      states: {
        normal: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
        hover: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'none',
            value: 0,
          },
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        y: {
          formatter: function (val: number) {
            return '$' + val ;
          },
        },
      },
      colors: ["#ff0000", "#00ff00"],
      grid: {
        padding: {
          top: 10,
        },
        borderColor: borderColor,
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
    };
  }
}