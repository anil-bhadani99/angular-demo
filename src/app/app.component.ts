import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ValidatorService} from 'angular-iban'
import { AddAccountComponent } from './add-account/add-account.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DemoProject';

  reactiveForm: any;

  ibanReactive: any;
  iBanData:any = [];
  URL = 'http://localhost:3000/transfer'

  constructor(private fb: FormBuilder,
    private http : HttpClient,
    private modalService: NgbModal) {
  }

  public ngOnInit(): void {
    this.getData();
    this.ibanReactive = new FormControl(
      null,
        [
          Validators.required,
          ValidatorService.validateIban
        ]
    );

    this.reactiveForm = this.fb.group({
      ibanReactive: this.ibanReactive,
    });
  }

  getData() {
    this.http.get(this.URL).subscribe((res:any) => {
      if (res && res.length) {
        res.forEach((element:any,index:number) => {
          element.index = index + 1
        });
        this.iBanData = res;
      }
    })
  }

  sortBy(text:any) {
    this.iBanData = this.iBanData.sort(function (a:any,b:any) {
     return b.amount - a.amount
    })
  }

  onEditClick(data:any) {
    this.openModal(data);
  }
  
  onDeleteClick(data:any) {
    this.http.delete(`${this.URL}/${data.id}`).subscribe (
      result => {
        this.getData();
      },
      error => {
        this.getData();
      }
    );
  }

  async openModal(data?:any) {
    const modalRef = this.modalService.open(AddAccountComponent, {ariaLabelledBy: 'modal-basic-title'})
    if (data) {
      modalRef.componentInstance.data = data;
    }
    const resultData = await modalRef.result.catch(e => console.log(e));

    if (resultData && resultData.success) {
      this.getData();
    }
  }
}
