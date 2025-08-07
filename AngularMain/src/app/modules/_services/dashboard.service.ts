import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    baseUrl = environment.KUPFApiUrl;
    constructor(private httpClient: HttpClient) {

    }

    GetDashBoardData(tenantId: number, locationId: number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/GetDashBoardData?tenentId=${tenantId}&locationId=${locationId}`);
    }

    GetServicePercent(tenantId:number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/ServicePercent?tenentId=${tenantId}`);
    }

    GetTotalEmployee(tenantId:number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/TotalEmployee?tenentId=${tenantId}`);
    }

    GetLoanVsRecive(tenantId:number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/LoanVsReceive?tenentId=${tenantId}`);
    }
    
    GetEmployeePerformance(tenantId: number)
    {
        return this.httpClient.get(this.baseUrl + `DashBoard/EmployeePerformance?tenentId=${tenantId}`);
    }

    GetEmployeePerformanceDetail(userId: number)
    {
        return this.httpClient.get(this.baseUrl + `DashBoard/EmployeePerformanceDetail?userId=${userId}`);
    }

    GetNewSubscripberDashboardModel (tenantId: number,  locationId: number, date: string) {
        return this.httpClient.get(this.baseUrl + `DashBoard/GetDashBoardData?tenentId=${tenantId}&locationId=${locationId}&date=${date}`);
    }

    GetMemberStatistics (tenantId: number,  locationId: number, periodCode: number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/GetMemberStatistics?tenentId=${tenantId}&locationId=${locationId}&periodCode=${periodCode}`);
    }

    GetLatestSubscriber (tenantId: number,  locationId: number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/GetLatestSubscriber?tenentId=${tenantId}&locationId=${locationId}`);
    }

    GetSubscriber (tenantId: number,  locationId: number, type: number) {
        return this.httpClient.get(this.baseUrl + `DashBoard/GetSubscriber?tenentId=${tenantId}&locationId=${locationId}&type=${type}`);
    }
}
