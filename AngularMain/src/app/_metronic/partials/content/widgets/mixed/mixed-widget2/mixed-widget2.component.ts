import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/modules/_services/dashboard.service';
import { getCSSVariableValue } from '../../../../../kt/_utils';
import { dashboardServicePercent } from 'src/app/modules/models/Dashboard/DashboardDto';

@Component({
  selector: 'app-mixed-widget2',
  templateUrl: './mixed-widget2.component.html'
})
export class MixedWidget2Component implements OnInit {
  @Input() chartColor: string = '';
  @Input() strokeColor: string = '';
  @Input() chartHeight: string = '';
  @Input() servicePercents: any;
  chartOptions: any = {};
  lang: any
  
  listPeriodCode: string[] = []
  listPercent: number[] = []
  listCount: number[] = []

  dashboardResponseDto: dashboardServicePercent

  constructor(private _commonService:DashboardService) {
 
  }

  ngOnInit(): void {
    this.getDashboardServiceSetup();
    this.lang = localStorage.getItem('lang');
  }

  getDashboardServiceSetup()
  {
    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;

    this._commonService.GetServicePercent(tenantId).subscribe((response:any)=>{
      this.dashboardResponseDto = response || { percents: []};

      console.log("ServiceStatistic::", this.dashboardResponseDto);
      this.chartOptions = this.getChartOptions(
        this.chartHeight,
        this.chartColor,
        this.strokeColor
      );
    });
  }

  getChartOptions(
    chartHeight: string,
    chartColor: string,
    strokeColor: string
  ) {
    const labelColor = getCSSVariableValue('--bs-gray-500');
    const borderColor = getCSSVariableValue('--bs-gray-200');
    const color = getCSSVariableValue('--bs-' + chartColor);
  
    for (const graphData of this.dashboardResponseDto.graphDatas) {
      if (graphData.periodCode !== null && graphData.count !== null) {
        this.listPeriodCode.push(graphData.periodCode);
        this.listPercent.push(graphData.percent);
        this.listCount.push(graphData.count);
      }
    }


    return {
      series: [
        {
          name: 'Transactions',
          data: this.listPercent,
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
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 5,
          left: 0,
          blur: 3,
          color: strokeColor,
          opacity: 0.5,
        },
      },
      plotOptions: {},
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'solid',
        opacity: 0,
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 3,
        colors: [strokeColor],
      },
      xaxis: {
        categories: this.listPeriodCode,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
        crosshairs: {
          show: false,
          position: 'front',
          stroke: {
            color: borderColor,
            width: 1,
            dashArray: 3,
          },
        },
      },
      yaxis: {
        min: 0,
        max: 160,
        labels: {
          show: false,
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
            return val.toFixed(2) + '%';
          },
        },
        marker: {
          show: false,
        },
      },
      colors: ['transparent'],
      markers: {
        colors: [color],
        strokeColors: [strokeColor],
        strokeWidth: 3,
      },
    };
  }
}
