import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {FormTitleHd} from 'src/app/modules/models/formTitleHd';
import {CommonService} from 'src/app/modules/_services/common.service';
import {CommunicationService} from 'src/app/modules/_services/communication.service';
import {DbCommonService} from 'src/app/modules/_services/db-common.service';
import {UserParams} from 'src/app/modules/models/UserParams';
import {ToastrService} from 'ngx-toastr';
import {ExcelParserService} from 'src/app/modules/_services/excel-parser.service';
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-monthly-loans-deduction',
  templateUrl: './monthly-loans-deduction.component.html',
  styleUrls: ['./monthly-loans-deduction.component.scss']
})

export class MonthlyLoansDeductionComponent implements OnInit {

  // We will filter form header labels array
  formHeaderLabels: any[] = [];

  formTitle: string;
  lang: any = '';
  totalRecords: any = 0;
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

  formData = {
    universityId: 0,
    contractTypeId: 0,
    departmentIdFrom: 0,
    departmentIdTo: 0,
    positionId: 0,
    serviceTypeId: 0,
    serviceSubType: 0,
    services: 0,
    periodFrom: 0,
    periodTo: 0
  };


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tableData: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  // To display table column headers
  //'Loan Desc',
  columnsToDisplay: string[] = ['LoanDesc','empId', 'Name', 'Loan Value', 'Installments', 'Installment Value', 'Loan' ,'Period', 'Start Deduction'];

  userParams: UserParams;

  // Incase of any error will display error message.
  dataLoadingStatus: string = '';

  // True of any error
  isError: boolean = false;

  // Hide footer while loading.
  isLoadingCompleted: boolean = false;

  masterServiceType$: any[] = [];
  recordLength = 0;
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
        if (labels.formID == this.formId && labels.language == this.languageType) {
          this.formHeaderLabels.push(labels);
          this.formBodyLabels.push(labels.formTitleDTLanguage);
        } else {
          index++;
          if(index === 1) {
            this.formHeaderLabels.push({"headerName": "Monthly Loans Deduction", "formID": "MonthlyLoansDeduction", "subHeaderName": "خصم القروض الشهرية", "status": "Active"})
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
  }
  generateLoansDeducationReport() {
    const filename = `Loans_Deducation_${new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}.pdf`;

    this._communicationService.generateLoansDeducationReport(
      this.userParams,
      this.tenentId,
      this.formData.universityId,
      this.formData.contractTypeId,
      this.formData.departmentIdFrom,
      this.formData.departmentIdTo == 0 ? this.departments[this.departments.length - 1].refid : this.formData.departmentIdTo,
      this.formData.positionId,
      this.formData.serviceTypeId,
      this.formData.serviceSubType,
      this.formData.services,
      this.formData.periodFrom == 0 ? parseInt(this.periods[0].code) : this.formData.periodFrom,
      this.formData.periodTo == 0 ? parseInt(this.periods[this.periods.length - 1].code) : this.formData.periodTo).subscribe((response: HttpResponse<Blob>)  => {
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
    if(this.formData.periodFrom > this.formData.periodTo) {
      this.toastr.error("Please select Period correctly.");
      return;
    }

    this.isLoadingCompleted = false;

    this._communicationService.GetEmployeeTransactionHistoryDetailsNew(
      this.userParams,
      this.tenentId,
      this.formData.universityId,
      this.formData.contractTypeId,
      this.formData.departmentIdFrom,
      this.formData.departmentIdTo == 0 ? this.departments[this.departments.length - 1].refid : this.formData.departmentIdTo,
      this.formData.positionId,
      this.formData.serviceTypeId,
      this.formData.serviceSubType,
      this.formData.services,
      this.formData.periodFrom == 0 ? parseInt(this.periods[0].code) : this.formData.periodFrom,
      this.formData.periodTo == 0 ? parseInt(this.periods[this.periods.length - 1].code) : this.formData.periodTo)
      .subscribe((response: any) => {
        console.log("-->", response);
        this.userParams.pageSize = response.body.totalRecords;
        this.recordLength = response.body.totalRecords;
        console.log("--->", this.recordLength)
        const rows = response.body.myList;
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];

          rows[i] = {
            LoanDesc: r.transactionHDServiceSubType,
            empId: r.dEemployeeID,
            name: r.arabicName,
            loan_value: r.totamt,
            installments: r.totInstallments,
            Installment_value: r.eachInstallmentsAmt,
            loan: r.loanAmount,
            Period: r.periodEnd,
            //loan_desc: r.ServiceName2,
            start_deduct: r.periodBegin,
          };
        }
        this.tableData = new MatTableDataSource<any>(rows);
        this.paginator.length = response.body.totalRecords;
        this.isLoadingCompleted = true;
      }, error => {
        this.dataLoadingStatus = 'Error fetching the data';
        this.isError = true;
      })
  }
  addMonthsToYearMonth(inputYearMonth: number, monthsToAdd: number): number {
    const year = Math.floor(inputYearMonth / 100);
    const month = inputYearMonth % 100;

    // Convert the year and month to a JavaScript Date object
    const dateObject = new Date(`${year}-${month}-01`);

    // Add the specified number of months
    dateObject.setMonth(dateObject.getMonth() + monthsToAdd);

    // Get the updated year and month
    const updatedYear = dateObject.getFullYear();
    const updatedMonth = dateObject.getMonth() + 1; // Adding 1 because getMonth() returns zero-based months

    // Combine the year and month back to the integer format
    return updatedYear * 100 + updatedMonth;
  }

  formattedDate(originalDate : string) {
    if (originalDate.length !== 6) {
      return originalDate; // Return as is if not in the expected format
    }

    const year = originalDate.substring(0, 4);
    const month = originalDate.substring(4, 6);
    return `${year}/${month}`;
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

  getPeriods() {
    this.commonDbService.GetPeriods().subscribe(data => {
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
      this.locations = data;
    })
  }

  getContractTypes() {
    this.commonDbService.GetContractType().subscribe(data => {
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
      serviceTypeId: new FormControl(''),
      periodFrom: new FormControl(''),
      periodTo: new FormControl(''),
    })
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
    this.excelParser.exportToExcel(this.tableData.data, "monthly-loans-deduction.xlsx");
  }
}
