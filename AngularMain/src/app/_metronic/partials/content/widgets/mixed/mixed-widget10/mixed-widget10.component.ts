import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';
import { dashboardTotalEmployee } from 'src/app/modules/models/Dashboard/DashboardDto';
import { getCSSVariableValue } from '../../../../../kt/_utils';
@Component({
  selector: 'app-mixed-widget10',
  templateUrl: './mixed-widget10.component.html',
})
export class MixedWidget10Component implements OnInit {
  @Input() chartColor: string = '';
  @Input() chartHeight: string;
  chartOptions: any = {};
  totalEmp:number=0;
  lang: any = '';

  dashboardResponseDto: dashboardTotalEmployee;
  listTotalEmp: number[] = [];
  listTotalMyperiod: string[] = [];

  constructor(private _commonService:DashboardService) {
   this.dashboardResponseDto;
   this.totalEmp=0;
  }

  ngOnInit(): void {
    this.getDashboardTotalEmployees();
    this.lang = localStorage.getItem('lang');
  }
  
  getDashboardTotalEmployees()
  {
      var data = JSON.parse(localStorage.getItem("user")!);
      const tenantId = data.tenantId;

      this._commonService.GetTotalEmployee(tenantId).subscribe((response:any)=>{
        
        this.dashboardResponseDto=response;

        console.log("TotalEmployees:::", this.dashboardResponseDto);

        this.totalEmp = this.dashboardResponseDto.totalEmployee;
 
        this.chartOptions = this.getChartOptions(this.chartHeight, this.chartColor);
      });
    }
 

    getChartOptions(chartHeight: string, chartColor: string) {
      const labelColor = getCSSVariableValue('--bs-gray-800');
      const strokeColor = getCSSVariableValue('--bs-gray-300');
      const baseColor = getCSSVariableValue('--bs-' + chartColor);
      const lightColor = getCSSVariableValue('--bs-light-' + chartColor);
    
      for (const graphData of this.dashboardResponseDto.employeeGraph) {
        if (graphData.periodCode !== null && graphData.count !== null) {
          this.listTotalMyperiod.push(graphData.periodCode);
          this.listTotalEmp.push(graphData.count);
        }
      }

      var list: number[] = [];
      list = [...this.listTotalEmp];

      return {
        series: [
          {
            name: 'Employees',
            data:list,
          },
        ],
        chart: {
          fontFamily: 'inherit',
          type: 'area',
          height: chartHeight,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {},
        legend: {
          show: true,
        },
        dataLabels: {
          enabled: false,
        
        },
        fill: {
          type: 'solid',
          opacity: 1,
        },
        stroke: {
          curve: 'smooth',
          show: true,
          width: 3,
          colors: [baseColor],
        },
        xaxis: {
          categories: this.listTotalMyperiod,
        
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: true,
          },
          labels: {
            show: true,
            style: {
              colors: labelColor,
              fontSize: '12px',
            },
          },
          crosshairs: {
            show: true,
            position: 'front',
            stroke: {
              color: strokeColor,
              width: 1,
              dashArray: 3,
            },
          },
          tooltip: {
            enabled: true,
          },
        },
        yaxis: {
          
          labels: {
            show: true,
            style: {
              colors: labelColor,
              fontSize: '12px',
            },
          },
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
              return '' + val + ' Employees';
            },
          },
        },
        colors: [lightColor],
        markers: {
          colors: [lightColor],
          strokeColors: [baseColor],
          strokeWidth: 1,
        },
      };
    }
}