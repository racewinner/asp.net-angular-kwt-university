import { ChildProcessWithoutNullStreams } from "child_process";

export interface dashboardTotalEmployee
{
    totalEmployee: number | 0;
    employeeGraph: Array <employeeGraph>;
}

export interface employeeGraph
{
    periodCode: string | null;
    count: number | 0;
    year: number | 0;
    month: number | 0;
}

export interface dashboardLoanVSReceived {
    totalLoanAmt: number | 0;
    totalReceivedAmt: number | 0;
    graphData: Array <loanReceivedGraph>;
}

export interface loanReceivedGraph {
    periodCode: string | null;
    loanAmt: number | 0 ;
    receivedAmt: number | 0;
}

export interface dashboardServicePercent {
    percents: Array <ServiceSetupPercent>;
    graphDatas: Array <ServiceSetupGraphData>;
}

export interface ServiceSetupGraphData {
    periodCode: string | null;
    count: number | 0;
    percent: number | 0;
}

export interface ServiceSetupPercent {
    count: number | 0
    serviceName: string | null
    percent: number | 0
}

export interface EmployeePerformanceData {
    count: number | 0
    employees: Array <EmployeePerformance>;
}

export interface EmployeePerformance {
    userId: number | 0
    firstName: string | null
    lastName: string | null
    loginId: string | null
}

export interface EmployeePerformanceDetail {
    asOfDate: Date | null
    myLabel1: string | ChildProcessWithoutNullStreams
    dateFormatted: string | null 
}