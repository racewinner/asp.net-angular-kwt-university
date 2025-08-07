import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownMenu1Component } from './dropdown-menu1/dropdown-menu1.component';
import { DropdownMenu2Component } from './dropdown-menu2/dropdown-menu2.component';
import { DropdownMenu3Component } from './dropdown-menu3/dropdown-menu3.component';
import { YearAndMonthSelectorComponent } from './year-month-selector/year-month-selector.component';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
  declarations: [
    DropdownMenu1Component,
    DropdownMenu2Component,
    DropdownMenu3Component,
    YearAndMonthSelectorComponent,
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  exports: [
    DropdownMenu1Component,
    DropdownMenu2Component,
    DropdownMenu3Component,
    YearAndMonthSelectorComponent,
  ],
})
export class DropdownMenusModule {}
