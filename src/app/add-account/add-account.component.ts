import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidatorService } from 'angular-iban';
import * as moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.css']
})
export class AddAccountComponent implements OnInit {

  @Input()
  data:any; 

  accountInfoForm!: UntypedFormGroup;
  iban:any;
  maxValueCrossed = false;
  isDot = false;
  currentDate:any = new Date();
  URL = 'http://localhost:3000/transfer'

  constructor(public modal: NgbActiveModal,
    private formBuilder: UntypedFormBuilder,
    private http : HttpClient) { 
      this.createForm();
  }

  ngOnInit(): void {
    if (this.data && this.data instanceof Object) {
        this.data.date = moment(this.data.date).format('L');
      this.setValueOfFormControl(['accountHolder','amount','iban','note']);
    }
  }

  createForm() {
    this.iban = new FormControl(
      null,
        [
          Validators.required,
          ValidatorService.validateIban
        ]
    );

    this.accountInfoForm = this.formBuilder.group({
      accountHolder: [null, Validators.required],
      amount: [null,Validators.required],
      // amount: [null,Validators.compose([Validators.required,Validators.min(2)])],
      date: [null,Validators.required],
      iban: this.iban,
      note: [null,Validators.required]
    });

    this.accountInfoForm.get('amount')?.valueChanges.subscribe(value => {
      if (value) {
        if (value.toString().length < 2 || value.toString().length > 8) {
          this.maxValueCrossed = true;
        } else {
          this.maxValueCrossed = false;
        }
      }
    })
  }

  setValueOfFormControl(formFieldArray:any[]) {
    if (formFieldArray && formFieldArray.length) {
      formFieldArray.forEach(f => {
        this.accountInfoForm.get(f)?.setValue(this.data[f])
      })
    }
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*(\.\d{0,2})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
 
    if (!reg.test(input)) {
        event.preventDefault();
    }
 }

  onSave() {
    let payload = this.accountInfoForm.value;
    payload.date = moment(payload.date).locale("de")
    if (this.data && Object.entries(this.data)){
      this.http.put(`${this.URL}/${this.data.id}`,payload).subscribe((res:any) => {
        if (res && res instanceof Object) {
          this.modal.close({success: true,})
        }
      })
    } else {
      this.http.post(`${this.URL}`,payload).subscribe((res:any) => {
        if (res && res instanceof Object) {
          this.modal.close({success: true,})
        }
      })
    }
  }
}
