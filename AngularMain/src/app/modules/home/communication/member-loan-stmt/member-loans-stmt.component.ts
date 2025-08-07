import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { CommonService } from 'src/app/modules/_services/common.service';
import { CommunicationService } from 'src/app/modules/_services/communication.service';
import { DbCommonService } from 'src/app/modules/_services/db-common.service';
import { UserParams } from 'src/app/modules/models/UserParams';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-members-loans-stmt',
  templateUrl: './member-loans-stmt.component.html',
  styleUrls: ['./member-loans-stmt.component.scss']
})

export class MemberLoansStmtComponent implements OnInit {

  // We will filter form header labels array
  formHeaderLabels: any[] = [];

  formTitle: string;
  lang: any = '';

  // Language Type e.g. 1 = ENGLISH and 2 =  ARABIC
  languageType: any;

  // Selected Language
  language: any;

  // FormId
  formId: string;
  pageSize: number = 10;
  formGroup: FormGroup;

  // We will get form lables from lcale storage and will put into array.
  AppFormLabels: FormTitleHd[] = [];

  // We will filter form body labels array
  formBodyLabels: any[] = [];
  employeeNames: any[] = [];

  tenentId: number = 0;

  reportForm: FormGroup;

  universities: any[] = [];
  locations: any;
  contractTypes: any[] = [];
  departments: any[] = [];
  occupations: any[] = [];
  serviceTypes: any[] = [];
  periods: any[] = [];

  formData = {
    universityId: 0,
    employeeID: 0,

  };

  totalData: any[] = [];
  tableData: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  // To display table column headers
  columnsToDisplay: string[] = ['date', 'empId', 'desc', 'debit', 'credit', 'balance'];

  userParams: UserParams;

  // Incase of any error will display error message.
  dataLoadingStatus: string = '';

  // True of any error
  isError: boolean = false;

  // Hide footer while loading.
  isLoadingCompleted: boolean = false;

  masterServiceType$: any[] = [];


  constructor(private common: CommonService,
              private activatedRout: ActivatedRoute,
              private _communicationService: CommunicationService,
              private toastr: ToastrService,
              private commonDbService: DbCommonService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.tenentId = JSON.parse(
      localStorage.getItem('user') || '{}'
    ).tenantId;
    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang;
    })
    this.formTitle = this.common.getFormTitle();
    this.formTitle = '';
    // #region TO SETUP THE FORM LOCALIZATION
    // TO GET THE LANGUAGE ID e.g. 1 = ENGLISH and 2 =  ARABIC
    this.languageType = localStorage.getItem('langType');

    // To get the selected language...
    this.language = localStorage.getItem('lang');

    // To setup the form id so will will get form labels based on form Id
    this.formId = 'EmployeeHistoryDetails';

    // Check if LocalStorage is Not NULL
    if (localStorage.getItem('AppLabels') != null) {
      // Get data from LocalStorage
      this.AppFormLabels = JSON.parse(localStorage.getItem('AppLabels') || '{}');
      let index = 0;

      for (let labels of this.AppFormLabels) {
        // console.log("labels", labels)
        if (labels.formID == this.formId && labels.language == this.languageType) {
          this.formHeaderLabels.push(labels);
          this.formBodyLabels.push(labels.formTitleDTLanguage);
          console.log(this.formBodyLabels);
        } else {
          index++;
          if(index === 1) {
            this.formHeaderLabels.push({"headerName": "Member Loans Statement", "formID": "MemberLoansStatement", "subHeaderName": "تفاصيل تاريخ الموظف", "status": "Active"})
            this.formBodyLabels.push("report");
          }
        }
      }
    }

    this.getUniversities();
    this.initializeSearchForm();
    this.getEmployeeName()
  }

  loadData(pageIndex: number) {
    // this._communicationService.GetIncomingLetters(pageIndex + 1, this.pageSize, this.formGroup.value.searchTerm).subscribe((response: any) => {
    //   this.incommingCommunicationDto = new MatTableDataSource<IncommingCommunicationDto>(response.body);
    //  console.log(response.body)
    //   this.incommingCommunicationDto.paginator = this.paginator;
    //   this.incommingCommunicationDto.sort = this.sort;
    //   this.isLoadingCompleted = true;
    //   setTimeout(() => {
    //     this.paginator.pageIndex = pageIndex;
    //     this.paginator.length = response.body.totalRecords;
    //   });
    // }, error => {
    //   console.log(error);
    //   this.dataLoadingStatus = 'Error fetching the data';
    //   this.isError = true;
    // })
  }

  generateEmployeeLoansStatementsReport(pageIndex: any) {
    const filename = `Employee_Loans_Statements${new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}.pdf`;

    this._communicationService.generateEmployeeLoansStatementsReport(
      this.tenentId,
      this.formData.universityId,
      this.formData.employeeID).subscribe((response: HttpResponse<Blob>)  => {
      if (response.body) {
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);


        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.pdf';  // Specify a default file name
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      }})

  }

  filterRecords(pageIndex: any) {
    this.isLoadingCompleted = true;
    this._communicationService.getEmployeeLoanStatement(
      this.tenentId,
      this.formData.universityId,
      this.formData.employeeID)
      .subscribe((response: any) => {
        this.tableData = new MatTableDataSource<any>(response.body.employeeLedgerList.map((r: any) => {
          console.log(r)
          return {
            date: r.jvDate,
            jv: r.jv,
            Description: r.description,
            debit: r.dr,
            credit: r.cr,
            balance: r.cr
          }
        }));
      }, error => {
        this.dataLoadingStatus = 'Error fetching the data';
        this.isError = true;
      })
  }

  getUniversities() {
    this.commonDbService.GetUniversities().subscribe(data => {
      this.universities = [
        {
          univId: 0,
          univName1: 'All Universities',
          univName2: 'All Universities',
          univName3: 'All Universities'
        },
        ...data
      ];
    });
  }
  setEmployeeIdTo(event: any) {
    console.log(event.value)
    this.formData.employeeID = event.value;
    /*if ( this.selectedEmployeeFromId == '') {
      this.selectedEmployeeToId = this.selectedEmployeeFromId;
       }*/
  }
  getEmployeeName() {
    this.commonDbService.getEmployeeName().subscribe(data => {
      this.employeeNames = [
        ...data.map(item => ({ value: item.employeeId, label: item.employeeName }))
      ];
    })
  }

  initializeSearchForm() {
    this.reportForm = this.fb.group({
      universityId: new FormControl(''),
      employeeID: new FormControl(''),
    })

  }

  pageChanged(event: any) {
    if (event.pageIndex == 0) {
      this.userParams.pageNumber = event.pageIndex + 1
    } else if (event.length <= (event.pageIndex * event.pageSize + event.pageSize)) {
      this.userParams.pageNumber = event.pageIndex + 1;
    }
    else if (event.previousPageIndex > event.pageIndex) {
      this.userParams.pageNumber = event.pageIndex;
    } else {
      this.userParams.pageNumber = event.pageIndex + 1
    }
    this.userParams.pageSize = event.pageSize;
    // this.financialService.setUserParams(this.userParams);
    if (this.formGroup.value.searchTerm == null) {
      // this.loadData(event.pageIndex, 0, 0, 0);
    } else if (this.formGroup.value.searchTerm.length > 0) {
      // this.filterRecords(event.pageIndex);
    } else {
      // this.loadData(event.pageIndex, 0, 0, 0);
    }
  }

}
