import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SelectServiceTypeDto } from 'src/app/modules/models/ServiceSetup/SelectServiceTypeDto';
import { DbCommonService } from 'src/app/modules/_services/db-common.service';
import { CommunicationService } from 'src/app/modules/_services/communication.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import * as moment from 'moment';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { CommonService } from 'src/app/modules/_services/common.service';
import { ActivatedRoute } from '@angular/router';
import { FinancialService } from 'src/app/modules/_services/financial.service';
import { environment } from 'src/environments/environment';

interface AttachDocument {
  file: File;
  type: number;
}

export interface Fruit {
  name: string;
}

@Component({
  selector: 'app-document-attachment',
  templateUrl: './document-attachment.component.html',
  styleUrls: ['./document-attachment.component.scss'],
})
export class DocumentAttachmentComponent implements OnInit {
  @Input() parentFormGroup: FormGroup;
  @Input() documentAccordialDetails: string;
  documentAttachmentForm: FormArray<any>;
  selectDocTypeDto: any;

  addOnBlur = true;
  visible = true;
  selectable = true;
  removable = true;

  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  metaTag: string[] = [];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  // We will get form lables from lcale storage and will put into array.
  AppFormLabels: FormTitleHd[] = [];

  // We will filter form header labels array
  formHeaderLabels: any[] = [];
  ApplicantDoc: SelectServiceTypeDto[] = [];

  // We will filter form body labels array
  formBodyLabels: any = {
    en: {},
    ar: {},
  };
  formId: string;
  formTitle: string;
  lang: string;
  minimumDocuments: number;
  languageType: any;
  mytransid: any;
  tenantId: any;
  language: any;

  isEditable: Boolean = true;

  serviceTypeId: number;
  serviceSubTypeId: number;
  
  currentDocuments: any[] = [];
  removedDocuments: number[] = [];

  newDocumentFile: File | null;
  newDocumentFileType: number | undefined;
  newDocuments: AttachDocument[] = [];

  getForm!: FormGroup;
  @ViewChild('fruitInput', { static: false })
  fruitInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete!: MatAutocomplete;

  constructor(
    private fb: FormBuilder,
    public common: CommonService,
    private dbCommonService: DbCommonService,
    private _communicationService: CommunicationService,
    private activatedRout: ActivatedRoute,
    private toastrService: ToastrService,
    private financialService: FinancialService
  ) {
    this.mytransid = this.activatedRout.snapshot.paramMap.get('mytransid');
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) =>
        fruit ? this._filter(fruit) : this.allFruits.slice()
      )
    );
  }

  ngOnInit(): void {
    this.getFormdvalue();
    this.GetDocType();

    // To get minimum document counts
    if(this.parentFormGroup?.controls.employeeForm?.value.serviceTypeId && 
      this.parentFormGroup?.controls.employeeForm?.value.serviceSubTypeId) 
    {
        this.serviceTypeId = this.parentFormGroup.controls.employeeForm.value.serviceTypeId;
        this.serviceSubTypeId = this.parentFormGroup.controls.employeeForm.value.serviceSubTypeId;
        this.GetServiceTypeSubServiceTypeByTenentId(this.serviceTypeId, this.serviceSubTypeId);
    }

    this.common.getLang().subscribe((lang: string) => {
      this.lang = lang;
    });

    //#region TO SETUP THE FORM LOCALIZATION
    // TO GET THE LANGUAGE ID e.g. 1 = ENGLISH and 2 =  ARABIC
    this.languageType = localStorage.getItem('langType');

    // To get the selected language...
    this.language = localStorage.getItem('lang');

    this.formId = 'AddService';

    // Check if LocalStorage is Not NULL
    if (localStorage.getItem('AppLabels') != null) {
      // Get data from LocalStorage
      this.AppFormLabels = JSON.parse(
        localStorage.getItem('AppLabels') || '{}'
      );

      for (let labels of this.AppFormLabels) {
        if (labels.formID == this.formId) {
          const jsonFormTitleDTLanguage = labels.formTitleDTLanguage.reduce(
            (result: any, element) => {
              result[element.labelId] = element;
              return result;
            },
            {}
          );
          if (labels.language == 1) {
            this.formBodyLabels['en'] = jsonFormTitleDTLanguage;
          } else if (labels.language == 2) {
            this.formBodyLabels['ar'] = jsonFormTitleDTLanguage;
          }
          // this.formBodyLabels.push(jsonFormTitleDTLanguage);
          console.log(this.formHeaderLabels);
          console.log(this.formBodyLabels);
        }
      }
    }

    // Get Tenant Id
    var data = JSON.parse(localStorage.getItem('user')!);
    this.tenantId = data.tenantId;
  }

  GetServiceTypeSubServiceTypeByTenentId(a1: any, b1: any) {
    var data = JSON.parse(localStorage.getItem('user')!);
    const tenantId = data.tenantId;
    this.financialService
      .GetServiceTypeSubServiceTypeByTenentId(tenantId)
      .subscribe((res: any) => {
        var val = res.find((x: any) => {
          return x.serviceTypeId == a1 && x.subServiceTypeId == b1;
        });
        this.minimumDocuments = val.documentsCount;
        console.log('minimum documents count = ' + this.minimumDocuments);
      });
  }
  GetDocType() {
    this.dbCommonService.GetDocTypes(21).subscribe(
      (response: any) => {
        console.log(response);
        this.selectDocTypeDto = response;
        this.ApplicantDoc = response.filter((item: any) => {
          return item.shortname == 'Applicant Photo';
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onNewDocumentSelected (e: any) {
    if (e.target.files.length > 0) {
      this.newDocumentFile = e.target.files[0];
    }
  }

  addNewDocument () {
    if(!this.newDocumentFile) {
      this.toastrService.error("Please select the document file.");
      return false;
    }
    if(!this.newDocumentFileType) {
      this.toastrService.error("Please select document type");
      return false;
    }

    this.newDocuments.push({
      file: this.newDocumentFile,
      type: this.newDocumentFileType
    });

    this.newDocumentFile = null;
    this.newDocumentFileType = undefined;

    return true;
  }

  onRemoveCurrentDocument (i: number) {
    this.removedDocuments.push(this.currentDocuments[i].serialno);
    this.currentDocuments.splice(i, 1);
  }

  onRemoveNewDocument (i: number) {
    this.newDocuments.splice(i, 1);
  }

  // Initialize form
  metatagarr: any;
  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit

      if ((value || '').trim()) {
        this.metaTag.push(value.trim());
        JSON.stringify(this.metaTag);
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.fruitCtrl.setValue(null);
    }
  }

  remove(fruit: string): void {
    const index = this.metaTag.indexOf(fruit);
    if (index >= 0) {
      this.metaTag.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.metaTag.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allFruits.filter(
      (fruit) => fruit.toLowerCase().indexOf(filterValue) === 0
    );
  }

  isInputValid() {
    if(this.newDocumentFile && this.newDocumentFileType) {
      this.addNewDocument();
    }

    if((this.currentDocuments.length + this.newDocuments.length) < this.minimumDocuments) {
      this.toastrService.error(`You should upload at least ${this.minimumDocuments} documents.`);
      return false;
    }

    return true;
  }

  saveDocumentAttachements() {
    if(!this.isInputValid()) return;

    //
    // prepare data for post
    this.formVal();
    var data = JSON.parse(localStorage.getItem('user')!);
    const tenantId = data.tenantId;
    const locationId = data.locationId;
    const username = data.username
    const userId = data.userId

    let formData = {
      ...this.getForm.value,
      mytransid: this.mytransid,
      metaTags: this.getForm.value.mtag,
      tenentID: tenantId,
      locationID: locationId,
      userId,
      username,
    };
    if(this.parentFormGroup?.controls.employeeForm?.value.employeeId) {
      formData.employeeId = this.parentFormGroup.controls.employeeForm?.value.employeeId
    }

    let finalformData = new FormData();
    Object.keys(formData).forEach((key) =>
      finalformData.append(key, formData[key])
    );
    this.newDocuments.forEach(newDoc => {
      finalformData.append('newDocumentFiles', newDoc.file);
    })
    finalformData.append('newDocumentTypes', JSON.stringify(this.newDocuments.map(newDoc => newDoc.type)));
    finalformData.append('removedDocuments', JSON.stringify(this.removedDocuments));

    if (this.mytransid) {
      this._communicationService
        .UpdateDocumentAttachmentService(finalformData)
        .subscribe((response: any) => {
          if(response) {
            this.toastrService.success('Saved documents successfully.')
          
            this.currentDocuments = response;
            this.removedDocuments = [];
            this.newDocuments = [];
            this.newDocumentFile = null;
            this.newDocumentFileType = undefined;
  
            if(this.currentDocuments?.length > 0) {
              this.getForm.controls['attachId'].setValue(this.currentDocuments[0].attachId);
              this.getForm.controls['createdDate'].setValue(
                moment(this.currentDocuments[0].createdDate).format('DD-MM-yyyy')
              );
            }
          } else {
            this.toastrService.error("Something went wrong.")
          }
        });
    } else {
      this.toastrService.warning("Please save the service first.");
    }
  }

  getFormdvalue() {
    this.getForm = this.fb.group({
      subject: ['', Validators.required],
      attachmentRemarks: ['', Validators.required],
      mtag: ['', Validators.required],
      attachId: [''],
      createdDate: [''],
    });
  }

  // This function would be called from add-service, add-lettersHd form, don't remove this function
  setValueofDocForm(res: any, type: string) {
    if(res.transactionHDDMSDtos?.length > 0) {
      this.currentDocuments = res.transactionHDDMSDtos;
      this.metaTag = this.currentDocuments[0].metaTags.split(',');
      this.getForm.controls['subject'].setValue(this.currentDocuments[0].subject);
      this.getForm.controls['attachmentRemarks'].setValue(this.currentDocuments[0].remarks);
      this.getForm.controls['attachId'].setValue(this.currentDocuments[0].attachId);
      this.getForm.controls['createdDate'].setValue(
        moment(this.currentDocuments[0].createdDate).format('DD-MM-yyyy')
      );
    } else {
      if(type === 'add-service') {
        let subject = "";
        subject = (this.lang === 'en' ? this.formBodyLabels.en.lblName.title : this.formBodyLabels.ar.lblName.title) + ':';
        subject += (this.lang === 'en' ? res.englishName : res.arabicName) + ',';
        subject += (this.lang === 'en' ? this.formBodyLabels.en.lblSalary.title : this.formBodyLabels.ar.lblSalary.title) + ':';
        subject += res.salary + ',';
        subject += (this.lang === 'en' ? this.formBodyLabels.en.lblSubscriptionDate.title : this.formBodyLabels.ar.lblSubscriptionDate.title) + ':';
        subject += (res.subscriptionDate ? new Date(res.subscriptionDate) : new Date()).toLocaleDateString();

        this.getForm.controls['subject'].setValue(subject);
        this.getForm.controls['attachmentRemarks'].setValue(subject);
        this.getForm.controls['createdDate'].setValue(new Date().toLocaleDateString());
        this.metaTag = subject.split(',');
      }
    }
  }

  formVal() {
    this.getForm.controls['mtag'].setValue(this.metaTag);
  }

  shouldAddApplicantDoc () {
    const ret = this.serviceTypeId == 1 && 
                this.serviceSubTypeId == 1 && 
                (!this.newDocuments || this.newDocuments?.length == 0) && 
                (!this.currentDocuments || this.currentDocuments?.length == 0);
    if(ret) this.newDocumentFileType = this.ApplicantDoc[0].refId;
    return ret;
  }

  getDocumentUrl(document: any) {
    const filename = document.attachmentPath.split(/[\\\/]/).pop();
    const url = `${environment.KUPFBaseUrl}/files/upload/${this.mytransid}/${filename}`;
    return url;
  }
}
