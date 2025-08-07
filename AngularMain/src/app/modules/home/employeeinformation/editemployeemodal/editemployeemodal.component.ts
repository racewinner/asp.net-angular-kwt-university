import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee} from '../../../../types/employee';
import { CountriesDto } from 'src/app/modules/models/CountriesDto';
import { SelectDepartmentsDto } from 'src/app/modules/models/SelectDepartmentsDto';
import { SelectOccupationsDto } from 'src/app/modules/models/SelectOccupationsDto';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from 'src/app/utils/general';
import { GenderArray } from '../../../../types/employee';

export interface EditEmployeeDialogData{
  employee: Employee,
  countries: CountriesDto[],
  departments: SelectDepartmentsDto[],
  contractTypes: SelectOccupationsDto[],
  occupations: SelectOccupationsDto[],
  onEmployeeUpdated: any
}

@Component({
  selector: 'app-editemployeemodal',
  templateUrl: './editemployeemodal.component.html',
  styleUrls: ['./editemployeemodal.component.scss'],
})
export class EditEmployeeModalComponent implements OnInit {
  editForm: FormGroup;
  isFormSubmitted: boolean = false;
  genderArray = GenderArray;

  constructor(
    private dialogRef: MatDialogRef<EditEmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditEmployeeDialogData,
    private toastrService: ToastrService,
    private formbuilder: FormBuilder
    ) { 
      
  }

  onClose() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.editForm = this.formbuilder.group({
      EnglishNAme: ['', Validators.required],
      ArabicNAme: ['', Validators.required],
      EmploymentDate: ['', Validators.required],
      JoinedDate: ['', Validators.required],
      PFNo: [0],
      SubscribedDate: [''],
      MemStatus: [0, Validators.required],
      AgreedSubmt: [''],
      AmountReceivedTillNow: [0, Validators.required],
      LastSalary: [0, Validators.required],
      TerminationDate: [''],
      Occupation: [0, [Validators.required, Validators.min(1)]],
      Gender: [1, [Validators.required, Validators.min(1)]],
      Mobile: [''],
      CivilID: ['', Validators.required],
      Birthday: ['', Validators.required],
      Department: [0, [Validators.required, Validators.min(1)]],
      ContractType: [0, [Validators.required, Validators.min(1)]],
      Email: ['', [Validators.email]],
      EmpPaciNo: [0, Validators.required],
      Nationality: [0, [Validators.required, Validators.min(1)]],
      NextToKin: ['']
    });

    this.editForm.patchValue({
      ...this.data.employee,
      EmploymentDate: this.data.employee.JoinedDate
    });
  }

  get empForm() {return this.editForm.controls;}

  onSubmit() {
    this.isFormSubmitted = true;
    if(this.editForm.invalid) {
      this.toastrService.warning("Please input all the mandatory fields!", "Warning");
      return;
    }

    const formData = this.editForm.value;
    const country = this.data.countries.find(c=>c.countryid === formData.Country);
    const data = {
      ...this.editForm.value,
      JoinedDate: formData.JoinedDate ? formatDate(formData.JoinedDate, false) : null,
      SubscribedDate: formData.SubscribedDate ? formatDate(formData.SubscribedDate, false) : null,
      TerminationDate: formData.TerminationDate ? formatDate(formData.TerminationDate, false): null,
      Birthday: formData.Birthday ? formatDate(formData.Birthday, false) : null,
      EmployeeNo: this.data.employee.EmployeeNo
    }
    this.data.onEmployeeUpdated && this.data.onEmployeeUpdated(data);

    this.dialogRef.close();
  }
}
