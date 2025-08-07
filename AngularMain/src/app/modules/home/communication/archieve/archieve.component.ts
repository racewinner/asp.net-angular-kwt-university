import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';
import { FormTitleDt } from 'src/app/modules/models/formTitleDt';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { LocalizationService } from 'src/app/modules/_services/localization.service';
import { CommonService } from 'src/app/modules/_services/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { DbCommonService } from 'src/app/modules/_services/db-common.service';
import { ToastrService } from 'ngx-toastr';
import { ExcelParserService } from 'src/app/modules/_services/excel-parser.service';
import { FormBuilder } from '@angular/forms';
import { SelectServiceTypeDto } from 'src/app/modules/models/ServiceSetup/SelectServiceTypeDto';
import { SelectLetterTypeDTo, SelectPartyTypeDTo } from 'src/app/modules/models/CommunicationDto';
import { getAttr } from 'src/app/utils/general';
import { AuthService } from 'src/app/modules/auth';
import { CommunicationService } from 'src/app/modules/_services/communication.service';

@Component({
  selector: 'app-archieve',
  templateUrl: './archieve.component.html',
  styleUrls: ['./archieve.component.scss']
})
export class ArchieveComponent implements OnInit {
  //  /*********************/
  //  formHeaderLabels$ :Observable<FormTitleHd[]>; 
  //  formBodyLabels$ :Observable<FormTitleDt[]>; 
  //  formBodyLabels :FormTitleDt[]=[]; 
  //  id:string = '';
  //  languageId:any;
  //  // FormId to get form/App language
  //  @ViewChild('ImportArchieves') hidden:ElementRef;
  //  /*********************/

  //#region 
    /*----------------------------------------------------*/

    // Language Type e.g. 1 = ENGLISH and 2 =  ARABIC
    languageType: any;

    // Selected Language
    language: any;

    // We will get form lables from lcale storage and will put into array.
    AppFormLabels: FormTitleHd[] = [];

    // We will filter form header labels array
    formHeaderLabels: any[] = [];

    // We will filter form body labels array
    formBodyLabels: any[] = [];

    // FormId
    formId: string;
    tenantId: any;
    locationId: any;
    userName: any;
    userId: any;

    docTypes: SelectServiceTypeDto[];
    senderParties: SelectLetterTypeDTo[];
    parties: SelectPartyTypeDTo[];
    
    archieveData: MatTableDataSource<any>;
    displayColumns: string[] = [
      'Exception',
      'Date',
      'DocumentType',
      'From',
      'To',
      'Reference',
      'Remarks',
      'AuthoritySigned',
      'FilledAT',
      'SearchTag'
    ];

    /*----------------------------------------------------*/  
  //#endregion


  constructor(
    private commonService:CommonService,
    private communicationService: CommunicationService,
    private commonDbService: DbCommonService,
    private toastr: ToastrService,
    private excelParserService: ExcelParserService,
    private fb: FormBuilder,
    private authService: AuthService,
    ) 
  { 

  }
  lang:string;
  ngOnInit(): void {
    this.tenantId = JSON.parse(
      localStorage.getItem('user') || '{}'
    ).tenantId;
    this.locationId = JSON.parse(
      localStorage.getItem('user') || '{}'
    ).locationId;
    this.userName = JSON.parse(
      localStorage.getItem('user') || '{}'
    ).username;
    this.userId = JSON.parse(
      localStorage.getItem('user') || '{}'
    ).userId;

    this.commonService.getLang().subscribe((lang: string) => {
      this.lang = lang;
    })
    //#region TO SETUP THE FORM LOCALIZATION    
    // TO GET THE LANGUAGE ID e.g. 1 = ENGLISH and 2 =  ARABIC
    this.languageType = localStorage.getItem('langType');

    // To get the selected language...
    this.language = localStorage.getItem('lang');

    // To setup the form id so will will get form labels based on form Id
    this.formId = 'ImportArchieves';

    // Check if LocalStorage is Not NULL
    if (localStorage.getItem('AppLabels') != null) {

      // Get data from LocalStorage
      this.AppFormLabels = JSON.parse(localStorage.getItem('AppLabels') || '{}');

      for (let labels of this.AppFormLabels) {

        if (labels.formID == this.formId && labels.language == this.languageType) {

          this.formHeaderLabels.push(labels);

          this.formBodyLabels.push(labels.formTitleDTLanguage);

        }
      }
    }

    this.commonDbService.GetDocTypes(this.tenantId).subscribe(docTypes=>{
      this.docTypes = docTypes;
    })
    this.commonDbService.getPartyType().subscribe(parties => {
      this.parties = parties;
    })
    this.commonDbService.getSenderPartyType().subscribe(senderParties => {
      this.senderParties = senderParties;
    })
    this.getArchieveExceptionData();
    //#endregion
  }

  getArchieveExceptionData() {
    const theThis = this;
    this.communicationService.GetArchieveExceptionData().subscribe(
      (rows: any) => {
        theThis.archieveData = new MatTableDataSource(rows.map((r: any)=>{
          const {exceptions, warnings} = theThis.checkValidate(r);
          r.Exceptions = exceptions;
          r.Warnings = warnings;
          return r;
        }));
      }
    )
  }
  
  onFileChange(event: any): void {
    const sheetName = 'ComArchieveUpload';
    const columns = [
      'Date', 'DocumentType', 'From', 'To', 'Reference', 'Remarks', 'AuthoritySigned', 'FilledAt', 'SearchTag'
    ];
    const file: File = event.target.files[0];

    this.excelParserService.parseExcelSheet(file, sheetName, columns)
      .then((data) => {
        this.archieveData = new MatTableDataSource(data.rows.map(row=>{
          row.Date = XLSX.SSF.format('mm/dd/yyyy', row.Date);

          if(typeof(row.DocumentType) === 'string') {
            row.DocumentTypeStr = row.DocumentType;
            row.DocumentType = getAttr('shortname', row.DocumentType, 'refId', 0, this.docTypes);
          } else if(typeof(row.DocumentType) === 'number') {
            row.DocumentTypeStr = this.docTypeName(row.DocumentType);
            if(!row.DocumentTypeStr) row.DocumentType = 0;
          } else {
            row.DocumentType = 0;
          }

          if(typeof(row.From) === 'string') {
            row.FromStr = row.From;
            row.From = getAttr('shortName', row.From, 'refId', 0, this.senderParties);
          } else if(typeof(row.From) === 'number') {
            row.FromStr = this.fromName(row.From);
            if(!row.FromStr) row.From = 0;
          } else {
            row.From = 0;
          }

          if(typeof(row.To) === 'string') {
            row.ToStr = row.To;
            row.To = getAttr('refname1', row.To, 'refId', 0, this.parties);
          } else if(typeof(row.To) === 'number') {
            row.ToStr = this.toName(row.To);
            if(!row.ToStr) row.To = 0;
          } else {
            row.To = 0;
          }

          const {exceptions, warnings} = this.checkValidate(row);
          row.Exceptions = exceptions;
          row.Warnings = warnings;

          return row;
        }));
      })
      .catch((error) => {
        this.toastr.error(error.message, 'Error');
        console.error('Error reading the file:', error);
      })
  }

  docTypeName = (refId: number) => {
    return getAttr('refId', refId, 'shortname', 'NA', this.docTypes);
  }
  fromName = (refId: number) => {
    return getAttr('refId', refId, 'shortName', 'NA', this.senderParties);
  }
  toName = (refId: number) => {
    return getAttr('refId', refId, 'refname1', 'NA', this.parties);
  }

  checkValidate = (row: any) => {
    const exceptions = [] as string[];
    const warnings = [] as string[];

    if(row.DocumentType === 0) exceptions.push('DocumentType');
    if(row.From === 0) exceptions.push('From');
    if(row.To === 0) exceptions.push('To');

    return {
      exceptions,
      warnings
    }
  }

  importData = () => {
    const theThis = this;
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.archieveData?.data?.length) {
      const importData = this.archieveData.data.filter(d=>d.Exceptions.length === 0);
      const exceptionData = this.archieveData.data.filter(d=>d.Exceptions.length > 0);

      if(importData.length == 0) {
        this.toastr.error("No data to accept.");
        return;
      } 

      const data = {
        tenantId: this.tenantId,
        locationId: this.locationId,
        userName: this.userName,
        userId: this.userId,
        importData,
        exceptionData
      }

      const theThis = this;

      this.communicationService.ImportArchieveData(data).subscribe(
        (response:any) => {
          if(response.result == 0) {
            theThis.toastr.success(`${response.message}`);
            theThis.archieveData = new MatTableDataSource(exceptionData);
          } else {
            theThis.toastr.error(response.message);
          }
        }, 
        (error: any) => {
          console.error(error);
          this.toastr.error('Something went wrong');
        });
    }
  }
}
