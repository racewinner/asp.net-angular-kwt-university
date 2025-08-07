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
import {ExcelParserService} from "../../../_services/excel-parser.service" ;


@Component({
  selector: 'app-general-assembly-report',
  templateUrl: './general-assembly-report.component.html',
  styleUrls: ['./general-assembly-report.component.scss']
})

export class GeneralAssemblyReportComponent implements OnInit {

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

  tenentId: number = 0;

  reportForm: FormGroup;

  universities: any[] = [];
  locations: any;
  contractTypes: any[] = [];
  departments: any[] = [];
  occupations: any[] = [];
  serviceTypes: any[] = [];
  periods: any[] = [];
  months = [
    { Name: '6 Months', id: 6 },
    { Name: '7 Months', id: 7 },
    { Name: '8 Months', id: 8 },
    { Name: '9 Months', id: 9 },
    { Name: '10 Months', id: 10 },
    { Name: '11 Months', id: 11 },
    { Name: '12 Months', id: 12 }
  ]


  formData = {
    universityId: 0,
    contractTypeId: 0,
    departmentIdFrom: 0,
    departmentIdTo: 0,
    positionId: 0,
    duration: 0,
  };


  totalData: any[] = [];
  tableData: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  // To display table column headers
  columnsToDisplay: string[] = ['empId', 'name', 'job_department', 'job_desc', 'pf_number', 'subscription_date', 'notes'];

  userParams: UserParams;

  // Incase of any error will display error message.
  dataLoadingStatus: string = '';

  // True of any error
  isError: boolean = false;

  // Hide footer while loading.
  isLoadingCompleted: boolean = false;

  masterServiceType$: any[] = [];

  get empHistoryForm() { return this.reportForm.controls; }

  constructor(private common: CommonService,
              private excelParser: ExcelParserService,
              private _communicationService: CommunicationService,
              private toastr: ToastrService,
              private commonDbService: DbCommonService,
              private fb: FormBuilder) {
    this.formGroup = new FormGroup({
      locationId: new FormControl(null),
      contactId: new FormControl(null)
    })
    this.userParams = this._communicationService.getUserParams();
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
            this.formHeaderLabels.push({"headerName": "General Assembly Report", "formID": "GeneralAssemblyReport", "subHeaderName": "تفاصيل تاريخ الموظف", "status": "Active"})
            this.formBodyLabels.push("report");
          }
        }
      }
    }

    this.getUniversities();
    this.getDepartments();
    this.getOccupations();
    this.getLocations();
    this.getContractTypes();
    this.getMasterContracts();
    this.initializeSearchForm();
  }

  generateAssemblyReport() {
    const filename = `General_Assembly_Report_${new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}.pdf`;

    this._communicationService.generateAssemblyReport(
      this.userParams,
      this.tenentId,
      this.formData.universityId,
      this.formData.contractTypeId,
      this.formData.departmentIdFrom,
      this.formData.departmentIdTo == 0 ? this.departments[this.departments.length - 1].refid : this.formData.departmentIdTo,
      this.formData.positionId,
      this.formData.duration
    ).subscribe((response: HttpResponse<Blob>)  => {
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
    this._communicationService.GetGeneralAssemblyDetails(
      this.userParams,
      this.tenentId,
      this.formData.universityId,
      this.formData.contractTypeId,
      this.formData.departmentIdFrom,
      this.formData.departmentIdTo == 0 ? this.departments[this.departments.length - 1].refid : this.formData.departmentIdTo,
      this.formData.positionId,
      this.formData.duration)
      .subscribe((response: any) => {
        this.userParams.pageSize = response.body.totalRecords;
        this.tableData = new MatTableDataSource<any>(response.body.empDetailsWithHistoryList.map((r: any) => {
          return {
            empId: r.dEemployeeID,
            name: r.arabicName,
            job_department: r.departmentEnglish,
            job_desc: r.departmentDesc,
            pf_number: r.depfid,
            subscription_date: r.subscribedDate,
            notes: r.denotes
          }
        }));
      }, error => {
        this.dataLoadingStatus = 'Error fetching the data';
        this.isError = true;
      })
  }

  getUniversities() {
    this.commonDbService.GetUniversities().subscribe(data => {
      console.log('universities', data);
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


  getDepartments() {
    this.commonDbService.GetDepartments().subscribe(data => {
      console.log('departments', data);
      this.departments = [
        {
          refid: 0,
          shortname: 'All Departments'
        },
        ...data
      ];
      this.departments.sort((a,b) => a.refid - b.refid);
    })
  }

  getOccupations() {
    this.commonDbService.GetOccupations().subscribe(data => {
      console.log('occupations', data);
      this.occupations = [
        {
          refid: 0,
          shortname: 'All Occupations'
        },
        ...data
      ]
    })
  }

  getLocations() {
    this.commonDbService.getLocations().subscribe(data => {
      console.log("localutons", data)
      this.locations = data;
    })
  }

  getContractTypes() {
    this.commonDbService.GetContractType().subscribe(data => {
      console.log("contractTypes", data)
      this.contractTypes = [
        {
          refid: 0,
          shortname: 'All ContractTypes'
        },
        ...data
      ]
    })
  }

  getMasterContracts() {
    this.commonDbService.GetMaterServiceTypes().subscribe((result) => {
      this.masterServiceType$ = result;
    });
  }

  initializeSearchForm() {
    this.reportForm = this.fb.group({
      universityId: new FormControl(''),
      contractTypeId: new FormControl(''),
      departmentIdFrom: new FormControl(''),
      departmentIdTo: new FormControl(''),
      positionId: new FormControl(''),
      duration: new FormControl(''),
    })

    // this.reportForm.patchValue({
    //   universityId: 0,
    //   contractTypeId: 0,
    //   departmentIdFrom: 0,
    //   departmentIdTo: 0,
    //   positionId: 0,
    //   serviceId: 0,
    //   periodFrom: 0,
    //   periodTo: 0,
    // })
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

  onDepartmentFromChange() {
    if(this.formData.departmentIdFrom == 0) this.formData.departmentIdTo = 0;
  }
  onDepartmentToChange() {
    if(this.formData.departmentIdTo == 0) this.formData.departmentIdFrom = 0;
  }
  exportToExcel() {
    this.excelParser.exportToExcel(this.tableData.data, "GeneralAssembly.xlsx");
  }
}
