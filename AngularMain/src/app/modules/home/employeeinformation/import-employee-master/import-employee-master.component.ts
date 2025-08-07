import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';
import { FormTitleDt } from 'src/app/modules/models/formTitleDt';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { LocalizationService } from 'src/app/modules/_services/localization.service';
import { EmployeeService } from 'src/app/modules/_services/employee.service';
import { AuthService } from 'src/app/modules/auth';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/modules/_services/common.service';
import { DbCommonService } from 'src/app/modules/_services/db-common.service';
import { MatTableDataSource } from '@angular/material/table';
import { ExcelParserService } from 'src/app/modules/_services/excel-parser.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { ChangeDetectorRef } from '@angular/core';
import { Employee } from '../../../../types/employee';
import { EditEmployeeModalComponent } from '../editemployeemodal/editemployeemodal.component';
import { CountriesDto } from 'src/app/modules/models/CountriesDto';
import { SelectDepartmentsDto } from 'src/app/modules/models/SelectDepartmentsDto';
import { SelectOccupationsDto } from 'src/app/modules/models/SelectOccupationsDto';
import { getAttr } from 'src/app/utils/general';
import { GenderArray } from '../../../../types/employee';

interface SampleFile {
  value: string;
  text: string;
}

@Component({
  selector: 'app-import-employee-master',
  templateUrl: './import-employee-master.component.html',
  styleUrls: ['./import-employee-master.component.scss'],
})
export class ImportEmployeeMasterComponent implements OnInit {
  // /*********************/
  //  formHeaderLabels$ :Observable<FormTitleHd[]>;
  //  formBodyLabels$ :Observable<FormTitleDt[]>;
  //  formBodyLabels :FormTitleDt[]=[];
  //  id:string = '';
  //  languageId:any;
  //  // FormId to get form/App language
  //  @ViewChild('ImportEmployeeMaster') hidden:ElementRef;
  // /*********************/
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

  // formGroup
  formGroup: FormGroup;

  countries: CountriesDto[];
  countries$: Observable<CountriesDto[]>;

  departments: SelectDepartmentsDto[];
  departments$: Observable<SelectDepartmentsDto[]>;

  contractTypes: SelectOccupationsDto[];
  contractTypes$: Observable<SelectOccupationsDto[]>;

  occupations: SelectOccupationsDto[];
  occupations$: Observable<SelectOccupationsDto[]>;

  // Sorting
  @ViewChild(MatSort) sort!: MatSort;

  // FormId
  formId: string;
  file: File | null = null;
  sampleFileTypes: SampleFile[] = [];
  selectedSampleFile: string = 'MonthlyDataUploader';
  tenantId: any;
  locationId: any;
  userId: any;
  userName: any;
  isEdit: boolean = false;
  /*----------------------------------------------------*/
  //#endregion
  importData: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  columnsToDisplay: string[] = [
    'name',
    'employeeId',
    'periodCode',
    'reference',
    'previous_Amount',
    'amount',
    'actions',
  ];
  totalData: any[] = [];
  searchTerm: string = '';
  filteredEmployeeData: MatTableDataSource<any>;
  // deptData: Dept[] = [];
  // jobData: Job[] = [];
  // contractData: Contract[] = [];
  // sdpData: SDP[] = [];
  // monthlyData: MonthlyData[];
  // comData: ComData[];

  displayedColumns: string[] = [
    'Action', 
    'Exception',
    'EmployeeNo',
    'EnglishNAme',
    'ArabicNAme',
    'JoinedDate',
    'PFNo',
    'SubscribedDate',
    'MemStatus',
    'AgreedSubmt',
    'AmountReceivedTillNow',
    'LastSalary',
    'TerminationDate',
    'Occupation',
    'Gender',
    'Mobile',
    'CivilID',
    'Birthday',
    'Department',
    'ContractType',
    'Email',
    'EmpPaciNo',
    'Nationality',
    'NextToKin',
  ];

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private commonDbService: DbCommonService,
    public commonService: CommonService,
    private toastr: ToastrService,
    private excelParserService: ExcelParserService,
    private fb: FormBuilder
  ) {
    this.countries$ = this.commonDbService.GetCountryList();
    this.countries$.subscribe(
      (countriesList) => {
        this.countries = countriesList;
      },
      (error) => {
        console.error('Error fetching countries:', error);
      }
    );

    this.departments$ = this.commonDbService.GetDepartments();
    this.departments$.subscribe(
      (departments) => {
        this.departments = departments;
      },
      (error) => {
        console.error('Error fetching departments', error);
      }
    )

    this.contractTypes$ = this.commonDbService.GetContractType();
    this.contractTypes$.subscribe(
      (contractTypes) => {
        this.contractTypes = contractTypes;
      },
      (error) => {
        console.error('Error fetching departments', error);
      }
    )

    this.occupations$ = this.commonDbService.GetOccupations();
    this.occupations$.subscribe(
      (occupations) => {
        this.occupations = occupations;
      },
      (error) => {
        console.error('Error fetching departments', error);
      }
    )
  }
  lang: string;
  periodCode: any;

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
    this.periodCode = JSON.parse(
      localStorage.getItem('user') || '{}'
    ).periodCode;

    this.formGroup = this.fb.group({
      searchTerm: [''],
    });
  
    const searchTermControl = this.formGroup.get('searchTerm');
    if (searchTermControl) {
      searchTermControl.valueChanges.subscribe((term) => {
        this.filterRecords(term);
      });
    }

    //#region TO SETUP THE FORM LOCALIZATION
    // TO GET THE LANGUAGE ID e.g. 1 = ENGLISH and 2 =  ARABIC
    this.commonService.getLang().subscribe((lang: string) => {
      this.lang = lang;
    });
    this.languageType = localStorage.getItem('langType');

    // To get the selected language...
    this.language = localStorage.getItem('lang');

    // To setup the form id so will will get form labels based on form Id
    this.formId = 'ImportEmployeeMaster';

    // Check if LocalStorage is Not NULL
    if (localStorage.getItem('AppLabels') != null) {
      // Get data from LocalStorage
      this.AppFormLabels = JSON.parse(
        localStorage.getItem('AppLabels') || '{}'
      );

      for (let labels of this.AppFormLabels) {
        if (
          labels.formID == this.formId &&
          labels.language == this.languageType
        ) {
          this.formHeaderLabels.push(labels);

          // this.formBodyLabels.push(labels.formTitleDTLanguage);
          const jsonFormTitleDTLanguage = labels.formTitleDTLanguage.reduce(
            (result: any, element) => {
              result[element.labelId] = element;
              return result;
            },
            {}
          );
          this.formBodyLabels.push(jsonFormTitleDTLanguage);
        }
      }
      console.log(this.formBodyLabels);
    }
    //#endregion
    this.getImportDataDropdown();
    this.getImportExceptionData();
  }

  editedId: number;
  editRow(val: boolean, id: number) {
    this.isEdit = val;
    this.editedId = id;
  }
  saveRow(val: boolean, id: number) {
    this.isEdit = val;
    this.editedId = id;
  }

  getImportExceptionData() {
    const theThis = this;
    this.employeeService.GetImportExceptionEmployeeData().subscribe(
      (employees: any) => {
        if(employees?.length > 0) {
          for(let i=0; i<employees.length; i++) {
            employees[i].Occupation = employees[i].JobTitle;
          }
          theThis.totalData = employees;
          theThis.filterRecords();
        }
      }
    )
  }

  getImportDataDropdown() {
    this.employeeService.GetImportDataUploader(this.tenantId).subscribe(
      (res: any) => {
        this.sampleFileTypes = res;
        console.log(this.sampleFileTypes);
      },
      (e) => {
        this.toastr.error('Something went wrong');
      }
    );
  }

  onFileChange(event: any): void {
    this.totalData = [];
    this.filteredEmployeeData = new MatTableDataSource();

    const sheetName = 'EmployeeData';
    const columns = ["EmployeeUnivNo", "EmployeeNo", "EnglishNAme", "ArabicNAme", "JoinedDate", "PFNo", "SubscribedDate",
                    "MemStatus", "AgreedSubmt","AmountReceivedTillNow","LastSalary","TerminationDate","Department","Occupation",
                    "Gender","Mobile","CivilID","Birthday","ContractType","Email","EmpPaciNo","Nationality","NextToKin"];

    const file: File = event.target.files[0];
    this.excelParserService
      .parseExcelSheet(file, sheetName, columns)
      .then((data) => {
        const employeeData = data.rows.filter(r => {
          return r.EmployeeNo ? true : false;
        });

        for(let i=0; i<employeeData.length; i++) {
          const e: any = employeeData[i];
          // data field
          e.JoinedDate = XLSX.SSF.format('mm/dd/yyyy', e.JoinedDate);
          e.SubscribedDate = XLSX.SSF.format('mm/dd/yyyy', e.SubscribedDate);
          e.TerminationDate = XLSX.SSF.format('mm/dd/yyyy', e.TerminationDate);
          e.Birthday = XLSX.SSF.format('mm/dd/yyyy', e.Birthday);
debugger;
          // To convert shortname to refid
          if(typeof(e.Department) === 'string') {
            e.Department = getAttr('refname2', e.Department, 'refid', 0, this.departments);
            if(!e.Department) e.Department = getAttr('refname1', e.Department, 'refid', 0, this.departments);
          }
          if(typeof(e.Occupation) === 'string') {
            e.Occupation = getAttr('refname2', e.Occupation, 'refid', 0, this.occupations);
            if(!e.Occupation) e.Occupation = getAttr('refname1', e.Occupation, 'refid', 0, this.occupations);
          }
          if(typeof(e.ContractType) === 'string') e.ContractType = getAttr('refname2', e.ContractType, 'refid', 0, this.contractTypes);
          if(typeof(e.Gender) === 'string') e.Gender = getAttr('name', e.Gender, 'id', 1, GenderArray);
          if(typeof(e.Nationality) === 'string') e.Nationality = getAttr('counamE1', e.Nationality, 'countryid', 0, this.countries);
          e.Exceptions = this.checkValidate(e);
          
          employeeData[i] = e;
        }
        this.totalData = employeeData;
        this.filterRecords();
        // this.filteredEmployeeData = new MatTableDataSource([...this.totalData]);
        console.log('load excel file ---------->', data);
      })
      .catch((error) => {
        this.toastr.error(error.message, 'Error');
        console.error('Error reading the file:', error);
      });
  }

  checkValidate(employee: any) {
    const subscribeTime = new Date(employee.SubscribedDate).getTime();
    const employeeTime = new Date(employee.EmploymentDate).getTime();
    const terminationTime = new Date(employee.TerminationDate).getTime();
    const civilIdRegex = /^\d{12}$/;
    const mobileRegex = /^\d{8}$/;

    const Exceptions: any[] = [];
    const warnings: any[] = [];
    if(!employee.Department) Exceptions.push('Department');
    if(!employee.Occupation) Exceptions.push('Occupation');
    if(!employee.ContractType) Exceptions.push('ContractType');
    if(!employee.Gender) Exceptions.push('Gender');
    if(!employee.Nationality) Exceptions.push('Nationality');
    if(subscribeTime && (subscribeTime < employeeTime)) Exceptions.push('SubscribeDate');
    if(terminationTime && (terminationTime < employeeTime)) Exceptions.push('TerminationDate');
    if(employee.CivilID && !civilIdRegex.test(employee.CivilID)) Exceptions.push('CivilID');
    if(employee.Mobile && !mobileRegex.test(employee.Mobile)) Exceptions.push('Mobile');

    return Exceptions;
  }

  downloadFile(): void {
    // Send a GET request to the server to download the file
    if (this.selectedSampleFile !== '') {
      this.employeeService
        .DownloadSampleFile("MonthlyDataUploaderCustomerData")
        .subscribe((response: any) => {
          // Create a URL for the response blob
          const url = URL.createObjectURL(response);

          // Create a link element and click it to trigger the download
          const link = document.createElement('a');
          link.href = url;
          link.download = this.selectedSampleFile;
          link.click();

          // Release the URL object
          URL.revokeObjectURL(url);
        });
    } else {
      this.toastr.warning(
        'Kindly select Uploader Type, before click on download'
      );
    }
  }
  importEmployeeData(): void {
    const theThis = this;
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.filteredEmployeeData?.data.length) {
      const importData = this.totalData.filter(d=>{
        return d.Exceptions.length == 0;
      })

      const exceptionData = this.totalData.filter(d=>{
        return d.Exceptions.length > 0;
      })

      for(let i=0; i<importData.length; i++) {
        const d = importData[i];
        d.JobTitle = d.Occupation;
        d.JobTitleName = this.occupationName(d.JobTitle);
        d.NationalityName = this.nationalityName(d.Nationality);
        d.DepartmentName = this.departmentName(d.Department);
        d.ContractTypeName = this.contractTypeName(d.ContractType);
      }

      const data = {
        tenantId: this.tenantId,
        locationId: this.locationId,
        userName: this.userName,
        userId: this.userId,
        employeeData: importData,
        exceptionData
      }

      this.employeeService
        .ImportEmployeeData(data)
        .subscribe((response: any) => {
          if(response.result == 0) {
            theThis.toastr.success(`${response.message}. Importd Rows: ${importData.length}`);
            theThis.totalData = theThis.totalData.filter(d=>{
              return d.Exceptions.length > 0;
            });
            theThis.filterRecords();
          } else  {
            theThis.toastr.error(response.message);
          }
        },
        (error: any) => {
          console.error(error);
          this.toastr.error('Something went wrong');
        });
    } else {
      this.toastr.warning('Invalid file or data information');
    }
  }

  filterRecords(term: string = '') {
    if (!term) {
      this.filteredEmployeeData = new MatTableDataSource([...this.totalData]);
    } else {
      this.filteredEmployeeData = new MatTableDataSource(this.totalData.filter((employee) =>
        Object.values(employee).some((val: any) =>
          val?.toString().toLowerCase().includes(term.toLowerCase())
        )
      ));
    }
  }
  clearFilter() {
    const searchTermControl = this.formGroup.get('searchTerm');
    if (searchTermControl) {
      searchTermControl.setValue('');
    }
  }

  occupationName(refid: number) {
    return getAttr('refid', refid, 'refname2','NA', this.occupations);
  }
  genderName(id: number) {
    return getAttr('id', id, 'name', 'NA', GenderArray);
  }
  contractTypeName(refid: number) {
    return getAttr('refid', refid, 'refname2', 'NA', this.contractTypes);
  }
  departmentName(refid: number) {
    return getAttr('refid', refid, 'refname2', 'NA', this.departments);
  }
  nationalityName(countryid: number) {
    return getAttr('countryid',countryid,'counamE1', 'NA', this.countries);
  }

  removeEmployee(employee: Employee) {
    if(window.confirm("Are you sure to remove this employee?") == false) return;

    let index = this.totalData.findIndex(e=>e.EmployeeNo == employee.EmployeeNo);
    if(index >= 0) this.totalData.splice(index, 1);

    const tableData = this.filteredEmployeeData.data;
    index = tableData.findIndex(e => e.EmployeeNo === employee.EmployeeNo);
    if(index >= 0) {
      tableData.splice(index, 1);
      this.filteredEmployeeData = new MatTableDataSource(tableData);
    }
  }

  editEmployee(employee: Employee) {
    const dialogRef = this.dialog.open(EditEmployeeModalComponent, {
      data: {
        employee,
        countries: this.countries,
        departments: this.departments,
        contractTypes: this.contractTypes,
        occupations: this.occupations,
        onEmployeeUpdated: this.onEmployeeUpdated.bind(this)
      },
      width: '900px',
    });
  }

  onEmployeeUpdated(updtOne: any) {
    updtOne.Exceptions = this.checkValidate(updtOne);

    const tableData = this.filteredEmployeeData.data;
    let index = tableData.findIndex(e => e.EmployeeNo === updtOne.EmployeeNo);
    if(index >= 0) {
      tableData[index] = {...updtOne};
      this.filteredEmployeeData = new MatTableDataSource(tableData);
    }

    index = this.totalData.findIndex(e => e.EmployeeNo === updtOne.EmployeeNo);
    if(index >= 0) {
      this.totalData[index] = {...updtOne};
    }
  }
}
