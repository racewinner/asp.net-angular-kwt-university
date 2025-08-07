import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormTitleDt } from 'src/app/modules/models/formTitleDt';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { LocalizationService } from 'src/app/modules/_services/localization.service';
import { CommonService } from 'src/app/modules/_services/common.service';
import {HttpResponse} from "@angular/common/http";
import {CommunicationService} from "../../../_services/communication.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {UserParams} from "../../../models/UserParams";
import {MatTableDataSource} from "@angular/material/table";
import {DbCommonService} from "../../../_services/db-common.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute} from "@angular/router";
import {SelectionModel} from "@angular/cdk/collections";
import {EmployeeService} from "../../../_services/employee.service";
import {DetailedEmployee} from "../../../models/DetailedEmployee";
import {ExcelParserService} from "../../../_services/excel-parser.service";

@Component({
  selector: 'app-debit-certificate-details',
  templateUrl: './debit-certificate-details.component.html',
  styleUrls: ['./debit-certificate-details.component.scss']
})


export class DebitCertificateDetailsComponent implements OnInit {

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
    indexEmployee: number = 0;
    selectedEmployeeFromId: number = 0;

  reportForm: FormGroup;


  universities: any[] = [];
  locations: any;
  contractTypes: any[] = [];
  employeeNames: any[] = [];
  departments: any[] = [];
  occupations: any[] = [];
  serviceTypes: any[] = [];
  periods: any[] = [];


  formData = {
    universityId: 0,
    contractTypeId: 0,
    employeeIDFrom: 0,
    employeeIDTo: 0,
    departmentIdFrom: 0,
    departmentIdTo: 0,
    positionId: 0,
    periodFrom: 0,
    periodTo: 0
  };

  checkedToPrint : boolean = false;

  tableData: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  // To display table column headers
  columnsToDisplay: string[] = ['select','empId', 'name', 'job_department', 'job_desc', 'pf_number', 'subscription_date', 'notes'];

  userParams: UserParams;

  // Incase of any error will display error message.
  dataLoadingStatus: string = '';

  // True of any error
  isError: boolean = false;

  // Hide footer while loading.
  isLoadingCompleted: boolean = false;

  masterServiceType$: any[] = [];

  selection = new SelectionModel<any>(true, []);
  constructor(private common: CommonService,
              private _communicationService: CommunicationService,
              private excelParser: ExcelParserService,

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
            this.formHeaderLabels.push({ "headerName": "Debit Certificate", "formID": "EmployeeCertificate", "subHeaderName": "شهادة الخصم", "status": "Active"})
            this.formBodyLabels.push("report");
          }
        }
      } 
    }

    this.getUniversities();
    this.getDepartments();
    this.getOccupations();
    this.getServiceTypes();
    this.getLocations();
    this.getContractTypes();
    this.getMasterContracts();
    this.initializeSearchForm();
    this.getPeriods();
    this.getEmployeeName()
  }
    onClickCkeck(event: any, row: any, index: number) {
        this.checkedToPrint = true ;
        event.stopPropagation();
        this.selection.clear();
        if (this.indexEmployee !== index) {
            this.indexEmployee = index;
            this.selectedEmployeeFromId = row.empId;
        } else {
            // If the clicked row is already selected, deselect it
            this.selection.toggle(row);
            this.indexEmployee = -1;
            this.selectedEmployeeFromId = 0;
        }
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.tableData.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.tableData.data.forEach(row => this.selection.select(row));
    }

  /*  isSelectedPage() {
      const numSelected = this.selection.selected.length;
      const page = this.tableData.paginator.pageSize;
      let endIndex: number;
      // First check whether data source length is greater than current page index multiply by page size.
      // If yes then endIdex will be current page index multiply by page size.
      // If not then select the remaining elements in current page only.
      if (this.tableData.data.length > (this.tableData.paginator.pageIndex + 1) * this.tableData.paginator.pageSize) {
        endIndex = (this.tableData.paginator.pageIndex + 1) * this.tableData.paginator.pageSize;
      } else {
        // tslint:disable-next-line:max-line-length
        endIndex = this.tableData.data.length - (this.tableData.paginator.pageIndex * this.tableData.paginator.pageSize);
      }
      console.log(endIndex);
      return numSelected === endIndex;
    }*/



  /*  selectRows() {
      // tslint:disable-next-line:max-line-length
      let endIndex: number;
      // tslint:disable-next-line:max-line-length
      if (this.tableData.data.length > (this.tableData.paginator.pageIndex + 1) * this.tableData.paginator.pageSize) {
        endIndex = (this.tableData.paginator.pageIndex + 1) * this.tableData.paginator.pageSize;
      } else {
        // tslint:disable-next-line:max-line-length
        endIndex = this.tableData.data.length;
      }

      for (let index = (this.tableData.paginator.pageIndex * this.tableData.paginator.pageSize); index < endIndex; index++) {
        this.selection.select(this.tableData.data[index]);
      }
    }*/

  /*  logSelection() {
      this.selection.selected.forEach(s => console.log(s.name));
    }*/

  generateEmployeeCertificate(){
    const filename = `Certificate_${new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}.pdf`;
    this._communicationService.generateEmployeeCertificate(
      this.userParams,
        this.tenentId,
        this.formData.universityId,
        this.formData.contractTypeId,
        this.formData.employeeIDFrom,
        999999,
        this.formData.departmentIdFrom,
        this.formData.departmentIdTo == 0 ? this.departments[this.departments.length - 1].refid : this.formData.departmentIdTo,
        this.formData.positionId,
        this.formData.periodFrom == 0 ? parseInt(this.periods[0].code) : this.formData.periodFrom,
        this.formData.periodTo == 0 ? parseInt(this.periods[this.periods.length - 1].code) : this.formData.periodTo,
        this.indexEmployee,
        this.selectedEmployeeFromId).subscribe((response: HttpResponse<Blob>)  => {
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
  filterRecords() {
      this.checkedToPrint = false ;
      if(this.formData.periodFrom > this.formData.periodTo) {
      this.toastr.error("Please select Period correctly.");
      return;
    }
    this.isLoadingCompleted = true;
    console.log(this.formData)
    this._communicationService.GetEmployeeHistoryDetailsForCertificate(
      this.userParams,
      this.tenentId,
      this.formData.universityId,
      this.formData.contractTypeId,
      this.formData.employeeIDFrom,
      999999,
      this.formData.departmentIdFrom,
      this.formData.departmentIdTo == 0 ? this.departments[this.departments.length - 1].refid : this.formData.departmentIdTo,
      this.formData.positionId,
      this.formData.periodFrom == 0 ? parseInt(this.periods[0].code) : this.formData.periodFrom,
      this.formData.periodTo == 0 ? parseInt(this.periods[this.periods.length - 1].code) : this.formData.periodTo)
      .subscribe((response: any) => {
        console.log(response, 'getemployee history')
        this.tableData = new MatTableDataSource<any>(response.body.empDetailsWithHistoryList.map((r: any) => {
          return {
            empId: r.dEemployeeID,
            name: r.arabicName,
            job_department: r.departmentTypeArabic,
            job_desc: r.departmentDesc,
            pf_number: r.depfid,
            subscription_date: r.subscribedDate,
            contract_type:r.contractType
          }
        }));
      }, error => {
        this.dataLoadingStatus = 'Error fetching the data';
        this.isError = true;
      })


  }
  getEmployeeName() {
    this.commonDbService.getEmployeeName().subscribe(data => {
      this.employeeNames = data.map(item => ({ value: item.employeeId, label: item.employeeName }));
    })
  }

  setEmployeeIdTo(event: any) {
    this.formData.employeeIDFrom = event.value;
    /*if ( this.selectedEmployeeFromId == '') {
      this.selectedEmployeeToId = this.selectedEmployeeFromId;
       }*/
  }

  /*  async getEmployeeToById(event: any) {
      this.selectedEmployeeToId = event.value;
      this.isLoadingCompleted = true;


    }*/

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



  getPeriods() {
    this.commonDbService.GetPeriods().subscribe(data => {
      console.log('Periods', data);
      this.periods = [];
      this.periods.push({
        code: 0,
        shortname: 'All Periods'
      })

      for(let i=0; i<data.length; i++) {
        this.periods.push({
          code: data[i],
          shortname: data[i].toString()
        })
      }
    })
  }

  getServiceTypes() {
    this.commonDbService.GetServiceType(this.tenentId).subscribe(data => {
      console.log('serviceTypes', data);
      this.serviceTypes = [
        {
          refid: 0,
          shortname: 'All ServiceTypes'
        },
        ...data
      ]
    })
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
      employeeIDFrom: new FormControl(''),
      employeeIDTo: new FormControl(''),
      departmentIdFrom: new FormControl(''),
      departmentIdTo: new FormControl(''),
      positionId: new FormControl(''),
      periodFrom: new FormControl(''),
      periodTo: new FormControl(''),
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
        this.userParams.pageNumber = event.pageIndex + 1
        this.userParams.pageSize = event.pageSize;
        this.filterRecords();
    }


    onDepartmentFromChange() {
    if(this.formData.departmentIdFrom == 0) this.formData.departmentIdTo = 0;
  }
  onDepartmentToChange() {
    if(this.formData.departmentIdTo == 0) this.formData.departmentIdFrom = 0;
  }
  onPeriodFromChange() {
    if(this.formData.periodFrom == 0) this.formData.periodTo = 0;
  }
  onPeriodToChange() {
    if(this.formData.periodTo == 0) this.formData.periodFrom = 0;
  }

  exportToExcel() {
    this.excelParser.exportToExcel(this.tableData.data, "Certificate.xlsx");
  }
}
