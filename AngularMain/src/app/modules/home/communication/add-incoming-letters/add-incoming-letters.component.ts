import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IncommingCommunicationDto, SelectLetterTypeDTo, SelectPartyTypeDTo } from 'src/app/modules/models/CommunicationDto';
import { FormTitleDt } from 'src/app/modules/models/formTitleDt';
import { FormTitleHd } from 'src/app/modules/models/formTitleHd';
import { SelectUsersDto } from 'src/app/modules/models/SelectUsersDto';
import { SelectServiceTypeDto } from 'src/app/modules/models/ServiceSetup/SelectServiceTypeDto';
import { CommunicationService } from 'src/app/modules/_services/communication.service';
import { DbCommonService } from 'src/app/modules/_services/db-common.service';
import { LocalizationService } from 'src/app/modules/_services/localization.service';
import { environment } from 'src/environments/environment';
import { DocumentAttachmentComponent } from '../../_partials/document-attachment/document-attachment.component';
import { CommonService } from 'src/app/modules/_services/common.service';
import { map, startWith } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Location } from '@angular/common';

export interface Fruit {
  name: string;
}

@Component({
  selector: 'app-add-incoming-letters',
  templateUrl: './add-incoming-letters.component.html',
  styleUrls: ['./add-incoming-letters.component.scss']
})
 
export class AddIncomingLettersComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  metaTag: string[] = [];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.metaTag.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(fruit: string): void {
    const index = this.metaTag.indexOf(fruit);

    if (index >= 0) {
      this.metaTag.splice(index, 1);
    }
  }

  
  name = 'Tags input';
  tagsInput = [];
  limit = 5;
  header = 'Tags input';
  placeholder = 'Enter tags';
  mode = 'success';
  text = `"<label for=\"headerText\">{{ header }}</label>\n<input\n  type=\"text\"\n  class=\"input-tags\"\n  (change)=\"add($event)\"\n  [style.borderColor]=\"mode\"\n  [placeholder]=\"placeholder\"\n/>\n<label for=\"\">Maximum tags allowed {{ limit }} </label>\n<div class=\"righter\">\n  <span\n    class=\"labeler\" (click)=\"remove(i)\"\n    [style.backgroundColor]=\"mode\"\n    *ngFor=\"let item of tags; index as i\"\n  >\n    {{ item }}&nbsp;&times;\n  </span>\n</div>\n",`;
  displayTags(tag: any) {
    this.tagsInput = tag;
  }
  inCommunicationForm: FormGroup;
  documentAttachments: FormGroup;
  form:FormGroup;
  transId: any;
  employeeId: number
  isFormSubmitted = false;
  baseUrl = environment.KUPFApiUrl;
  @ViewChild(DocumentAttachmentComponent) documentattachmentcomponent!: DocumentAttachmentComponent;
  incommingCommunicationDto$: Observable<any[]>;

  incommingCommunicationDto: IncommingCommunicationDto[];
  selectedLetterType:string="0";
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

  /*----------------------------------------------------*/
  //#endregion
  letterType$: Observable<SelectLetterTypeDTo[]>;
  lType=0;
  partyType$: Observable<SelectPartyTypeDTo[]>;
  filledAt$: Observable<SelectPartyTypeDTo[]>;
  users$: Observable<SelectUsersDto[]>;
  selectDocTypeDto$: Observable<SelectServiceTypeDto[]>;
  objIncommingCommunicationDto: IncommingCommunicationDto;
  selectedItem = null;
    items = ['test'];
    tagSuggestions = ['google', 'apple', 'microsoft'];
  constructor(
    private commonDbService: DbCommonService,
    private fb: FormBuilder,
    private commonService:CommonService,
    private activatedRoute: ActivatedRoute,
    private _communicationService: CommunicationService,
    private location: Location,
    private http: HttpClient,
    private toastr: ToastrService,) {
    this.transId = this.activatedRoute.snapshot.paramMap.get('mytransid');
   
  }
  
  lang:string;
  letterTypeselectedvalue: any;
  fg:FormGroup;
  selectedOption='0';
  
  ngOnInit(): void {
    this.selectedOption = '1'; 
    this.commonService.getLang().subscribe((lang: string) => {
      this.lang = lang;
    })
    this.selectedLetterType = '0'; // Add this line
  console.log('Selected Letter Type:', this.selectedLetterType); 
    //#region TO SETUP THE FORM LOCALIZATION    
    // TO GET THE LANGUAGE ID e.g. 1 = ENGLISH and 2 =  ARABIC
    this.languageType = localStorage.getItem('langType');

    // To get the selected language...
    this.language = localStorage.getItem('lang');

    // To setup the form id so will will get form labels based on form Id
    this.formId = 'AddIncomingLetters';

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
      console.log(this.formHeaderLabels)
    }
    //#endregion
       
    this.initializeCommunicationDeliveryForm();
    this.letterType$ = this.commonDbService.getLetterType();
   
  //  this.fg=new FormGroup({
  //     lType:new FormControl(this.lType)
  //   });
    this.partyType$ = this.commonDbService.getPartyType();
    
    this.filledAt$ = this.commonDbService.getFilledAtAsync();
    //
    this.users$ = this.commonDbService.GetUsers();
    //
    this.selectDocTypeDto$ = this.commonDbService.GetDocTypes(21);
    if (this.transId) {
      this._communicationService.GetIncomingLetter(this.transId).subscribe((response: any) => {
        this.metaTag=response.searchTag.split(',');
        this.inCommunicationForm.patchValue({
          letterType: response.letterType,
          receivedSentDate: response.receivedSentDate ? moment(response.receivedSentDate).format("DD-MM-yyyy") : new Date(),
          senderReceiverParty: response.senderReceiverParty,
          representative: response.representative,
          employeeId: response.employeeId,
          letterDated: response.letterDated ? moment(response.letterDated).format("DD-MM-yyyy") : new Date(),
          filledAt: response.filledAt,
          description: response.description,
          searchTag: response.searchTag,
          mytransid: response.mytransid,
          userDocumentNo: response.userDocumentNo,
          inOutApprovedBy:response.inOutApprovedBy,
        })

        this.documentattachmentcomponent.setValueofDocForm(response, 'add-incoming-letter');
      }, error => {
        console.log(error);
      })
    }
  }


  initializeCommunicationDeliveryForm() {
    this.inCommunicationForm = this.fb.group({
      tenentId: new FormControl('0'),
      locationId: new FormControl('0'),
      username: new FormControl(''),
      userId: new FormControl('0'),
      //letterType: new FormControl([0], Validators.required),
      letterType: [1,Validators.required],
      receivedSentDate: new FormControl(moment().format('DD-MM-YYYY'), Validators.required),
      // senderReceiverParty: new FormControl('', Validators.required),
      senderReceiverParty: [1,Validators.required],
      representative: new FormControl('', Validators.required),
      // employeeId: new FormControl('', Validators.required),
      letterDated: new FormControl(moment().format('DD-MM-YYYY'), Validators.required),
      filledAt: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
       searchTag: new FormControl(''),
       inOutApprovedBy:new FormControl('',Validators.required),
      mytransid: new FormControl(0),
      userDocumentNo: new FormControl('', Validators.required), 
      lType:[this.lType]
    })
  }

  saveClick() {
    if(this.documentattachmentcomponent.isInputValid() === false) {
      return;
    }

    // Get data from local storage
    var data = JSON.parse(localStorage.getItem("user")!);
    const tenantId = data.tenantId;
    const locationId = data.locationId;
    const userId = data.userId;
    const username = data.username;

    this.inCommunicationForm.patchValue({
      tenentId: tenantId,
      locationId: locationId,
      username: username,
      userId: userId,
    })

    this.documentattachmentcomponent.formVal();
    {
      console.log('test')
      this.isFormSubmitted = true;
      let formData = {
        ...this.inCommunicationForm.value,
        ...this.documentattachmentcomponent.formVal
      }

      formData['searchTag']=(this.metaTag).join(',');
      formData['letterDated'] = moment(formData['letterDated'], 'DD-MM-YYYY').format("yyyy-MM-DD");

      formData['receivedSentDate'] = moment(formData['receivedSentDate'], 'DD-MM-YYYY').format("yyyy-MM-DD");
      formData['subject'] = this.documentattachmentcomponent.getForm.value.subject;
      formData['attachmentRemarks'] = this.documentattachmentcomponent.getForm.value.attachmentRemarks;
      formData['metaTags'] = this.documentattachmentcomponent.metaTag;

      let finalformData = new FormData();
      Object.keys(formData).forEach(key => finalformData.append(key, formData[key]));

      this.documentattachmentcomponent.newDocuments.forEach(newDoc => {
        finalformData.append('newDocumentFiles', newDoc.file);
      })
      finalformData.append('newDocumentTypes', JSON.stringify(this.documentattachmentcomponent.newDocuments.map(newDoc => newDoc.type)));
      finalformData.append('removedDocuments', JSON.stringify(this.documentattachmentcomponent.removedDocuments));

      if (this.inCommunicationForm.valid) {
        if (this.transId) {   
          this._communicationService.UpdateIncomingLetter(finalformData).subscribe((response: any) => {
            if (response === true) {
              this.toastr.success("Saved Successfully", "Success");
            } else {
              this.toastr.error("Something went wrong", "Error");
            }
          }, error => {
            console.log(error);
          })
        } else {
          console.log('Add', formData);
          this._communicationService.AddIncomingLetter(finalformData).subscribe((response: any) => {
            if (response === true) {
              this.toastr.success("Saved Successfully", "Success");
              this.location.back();
            } else {
              this.toastr.error("Something went wrong", "Error");
            }
          }, error => {
            console.log(error);
          })
        }
      }
    }
    // this.saveDoc();
  }


  saveDoc() {
    this.documentattachmentcomponent.formVal();
  }

  // To access form controls...
  get inCommunicationFrm() { return this.inCommunicationForm.controls; }

}
