import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import { environment } from 'src/environments/environment';
import { IncommingCommunicationDto } from '../models/CommunicationDto';
import { LettersHdDto } from '../models/LettersHdDto';
import { UserParams } from '../models/UserParams';
import { TransactionHDDMSDto } from '../models/FinancialService/TransactionHDDMSDto';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  // Getting base URL of Api from enviroment.
  baseUrl = environment.KUPFApiUrl;
  //
  incommingCommunicationDto: IncommingCommunicationDto[] = []
  lettersHdDto: LettersHdDto[]=[];

  userParams: UserParams;

  constructor(private httpClient: HttpClient) {
    this.userParams = new UserParams();
  }
  httpOptions = {
    headers: new HttpHeaders({ 
      'Content-Type': 'application/json',
    })
  }; 
  httpFileOptions = {
    headers: new HttpHeaders({ 
      'Content-Type': 'multipart/form-data',
    })
  };
  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  // Add Incomming Letter
  AddIncomingLetter(response: FormData) {
    console.log(response);
    return this.httpClient.post(this.baseUrl + `Communication/AddIncomingLetter`, response);
  }

  UpdateIncomingLetter(response: FormData) {
    return this.httpClient.put(this.baseUrl +`Communication/UpdateIncomingLetter`,response);
  }

  // delete service setup
  DeleteIncomingLetter(transId: number) {
    return this.httpClient.delete(`${this.baseUrl}Communication/DeleteIncomingLetter/${transId}`);
  }

  // Get all service setup
  GetIncomingLetters(pageNumber: number, pageSize: number, query: string) {
    // return this.httpClient.get<IncommingCommunicationDto[]>(this.baseUrl + `Communication/GetIncomingLetters`).pipe(
    //   map(incommingCommunicationDto => {
    //     this.incommingCommunicationDto = incommingCommunicationDto;
    //     return incommingCommunicationDto;
    //   })
    // )
    return this.httpClient.get<IncommingCommunicationDto[]>(this.baseUrl + `Communication/GetIncomingLetters?PageNumber=${pageNumber}&PageSize=${pageSize}&Query=${query}`, {observe: 'response'});
  }

  GetIncomingLetter(transId: number) {
    return this.httpClient.get<LettersHdDto[]>(`${this.baseUrl}Communication/GetIncomingLetter/${transId}`).pipe(
      map(lettersHdDto => {
        this.lettersHdDto = lettersHdDto;
        return lettersHdDto;
      })
    )
  }


  generateBoundary(): string {
    return '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  }
  
  GetDocumentAttachmentsByMyTransId(myTransId:any) {    
    return this.httpClient.get<TransactionHDDMSDto[]>(this.baseUrl +`Communication/GetDocumentAttachmentsByMyTransId/${myTransId}`).pipe(
      map(transactionHddmsDtoList => {
        return transactionHddmsDtoList;
      })
    )
  }

  // Usage
    UpdateDocumentAttachmentService(response: FormData) {
    console.log("UpdateDocumentAttachmentService:::", response);
    return this.httpClient.put(this.baseUrl + 'Communication/UpdateDocumentAttachmentService', response);
  }

  
//==========out going letters
  // Get all service setup
  GetOutgoingLetters(pageNumber: number, pageSize: number, query: string) {
    // return this.httpClient.get<IncommingCommunicationDto[]>(this.baseUrl + `Communication/GetIncomingLetters`).pipe(
    //   map(incommingCommunicationDto => {
    //     this.incommingCommunicationDto = incommingCommunicationDto;
    //     return incommingCommunicationDto;
    //   })
    // )
    return this.httpClient.get<IncommingCommunicationDto[]>(this.baseUrl + `Communication/GetOutgoingLetters?PageNumber=${pageNumber}&PageSize=${pageSize}&Query=${query}`, {observe: 'response'});
  }

  ImportArchieveData(data: any) {
    return this.httpClient.post(this.baseUrl + `Communication/ImportArchieveData`, data);
  }
  GetArchieveExceptionData() {
    return this.httpClient.get(this.baseUrl + `Communication/GetArchieveExceptionData`);
  }
  GetGeneralAssemblyDetails(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    mymonth: number,
  ) {
    return this.httpClient.get(this.baseUrl + `RefTable/Get_GeneralAssemblyReport?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&mymonth=${mymonth}`, { observe: 'response' });
  }

  GetEmployeeHistoryDetails(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    servicesType: number,
    sTypeList: number,
    serviceSubType: number,
    services: number,
    periodFrom: number,
    periodTo: number
  ) {
    return this.httpClient.get(this.baseUrl + `RefTable/Get_DetailEmployee_History?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&servicesType=${servicesType}&sTypeList=${sTypeList}&serviceSubType=${serviceSubType}&services=${services}&periodFrom=${periodFrom}&periodTo=${periodTo}`, {observe: 'response'});
  }

  GetEmployeeTransactionHistoryDetails(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    serviceType: number,
    serviceSubType: number,
    services: number,
    periodFrom: number,
    periodTo: number
  ) {
    return this.httpClient.get(this.baseUrl + `RefTable/GetEmployeeTransactionHistoryByFilter?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&serviceType=${serviceType}&serviceSubType=${serviceSubType}&services=${services}&periodFrom=${periodFrom}&periodTo=${periodTo}`, {observe: 'response'});
  }
  GetEmployeeTransactionHistoryDetailsNew(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    serviceType: number,
    serviceSubType: number,
    services: number,
    periodFrom: number,
    periodTo: number
  ) {
    return this.httpClient.get(this.baseUrl + `RefTable/GetEmployeeHistoryByFilterNew?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&serviceType=${serviceType}&serviceSubType=${serviceSubType}&services=${services}&periodFrom=${periodFrom}&periodTo=${periodTo}`, { observe: 'response' });
  }



  GetEmployeeHistoryDetailsForCertificate(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    employeeIDFrom: number,
    employeeIDTo: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    periodFrom: number,
    periodTo: number
  ) {
    return this.httpClient.get(this.baseUrl + `RefTable/GetDetailEmployeeHistoryForCertificate?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&employeeIDFrom=${employeeIDFrom}&employeeIDTo=${employeeIDTo}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&&periodFrom=${periodFrom}&periodTo=${periodTo}`, {observe: 'response'});
  }


  getEmployeeLoanStatement(
    tenentId: number,
    university: number,
    employeeName: number
  ) {
    return this.httpClient.get(this.baseUrl + `RefTable/GetEmployeeLoansStatement?tenentId=${tenentId}&university=${university}&employeeName=${employeeName}`, {observe: 'response'});
  }

  








  generateLoansDeducationReport(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    serviceType: number,
    serviceSubType: number,
    services: number,
    periodFrom: number,
    periodTo: number
  ): Observable<HttpResponse<Blob>> {

    return this.httpClient.get(this.baseUrl + `Reports/GenerateLoansDeducationReport?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&serviceType=${serviceType}&serviceSubType=${serviceSubType}&services=${services}&periodFrom=${periodFrom}&periodTo=${periodTo}`, {observe: 'response', responseType: 'blob' });
  }


  generateEmployeeLoansStatementsReport(
    tenentId: number,
    university: number,
    employeeID: number,
  ): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(this.baseUrl + `Reports/GenerateEmployeeLoansStatementsReport?tenentId=${tenentId}&university=${university}&employeeID=${employeeID}`, {observe: 'response', responseType: 'blob' });
  }

  generateSubscribersLisReport(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    servicesType: number,
    sTypeList: number,
    serviceSubType: number,
    services: number,
    periodFrom: number,
    periodTo: number
  ): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(this.baseUrl + `Reports/GenerateSubscribersMembersReport?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&servicesType=${servicesType}&sTypeList=${sTypeList}&serviceSubType=${serviceSubType}&services=${services}&periodFrom=${periodFrom}&periodTo=${periodTo}`, {observe: 'response', responseType: 'blob' });
  }
  generateSubscribersDeducationReport(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    serviceType: number,
    serviceSubType: number,
    services: number,
    periodFrom: number,
    periodTo: number
  ): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(this.baseUrl + `Reports/GenerateSubscribeDeducationReport?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&serviceType=${serviceType}&serviceSubType=${serviceSubType}&services=${services}&periodFrom=${periodFrom}&periodTo=${periodTo}`, {observe: 'response', responseType: 'blob' });
  }


  generateEmployeeCertificate( userParams: UserParams,
                               tenentId: number,
                               university: number,
                               contractType: number,
                               employeeIDFrom: number,
                               employeeIDTo: number,
                               departmentFrom: number,
                               departmentTo: number,
                               occupation: number,
                               periodFrom: number,
                               periodTo: number,
                               indexEmployee: number,
                               selectedEmployeeFromId: number
                               ): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(this.baseUrl + `Reports/GenerateCertificatesReport?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&employeeIDFrom=${employeeIDFrom}&employeeIDTo=${employeeIDTo}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&periodFrom=${periodFrom}&periodTo=${periodTo}&indexEmployee=${indexEmployee}&selectedEmployeeFromId=${selectedEmployeeFromId}`, {observe: 'response', responseType: 'blob' });
  }



  generateAssemblyReport(
    userParams: UserParams,
    tenentId: number,
    university: number,
    contractType: number,
    departmentFrom: number,
    departmentTo: number,
    occupation: number,
    mymonth: number,
  ): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(this.baseUrl + `Reports/GenerateAssemblyReport?PageNumber=${userParams.pageNumber}&PageSize=${userParams.pageSize}&tenentId=${tenentId}&university=${university}&contractType=${contractType}&departmentFrom=${departmentFrom}&departmentTo=${departmentTo}&occupation=${occupation}&mymonth=${mymonth}`, { observe: 'response', responseType: 'blob' });
  }
}


