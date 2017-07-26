import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {EFFECT_CONTACT_US} from "../../store/effects/appdb.effects";

@Component({
    selector: 'contact-us',
    template: `
        <div class="container pull-left" style="width: 400px">
            <form [formGroup]="contactForm"
                  (submit)="submit($event)"
                  (success)="onSuccess($event)"
                  (error)="onError($event)"
                  connectForm="appDb.contact">

                <div class="form-group">
                    <input type="text" formControlName="email" class="form-control" placeholder="email address">
                </div>

                <div class="form-group">
                <textarea formControlName="message"
                          placeholder="your question"
                          cols="10" rows="3" class="form-control"></textarea>
                </div>

                <!--<div class="form-group">-->
                <!--<input type="checkbox" formControlName="draft"> Draft-->
                <!--</div>-->

                <select formControlName="category" [compareWith]="compareFn">
                    <option *ngFor="let option of options" [ngValue]="option.id">{{option.label}}</option>
                </select>
                <br/>
                <button style="margin-top: 20px" (click)="submit($event)" [disabled]="contactForm.invalid" class="btn btn-primary" type="button">Submit</button>

            </form>

            <div class="alert alert-success" *ngIf="success">Success!</div>
            <div class="alert alert-danger" *ngIf="error">{{error}}</div>

        </div>
    `
})
export class ContactUs {
    options = [{id: 1, label: 'Support'}, {id: 2, label: 'Sales'}]
    error;
    success;
    contactForm: FormGroup;

    constructor(private yp: YellowPepperService) {
    }

    onError(error) {
        this.error = error;
    }

    onSuccess(e) {
        this.success = true;
    }

    ngOnInit() {
        this.contactForm = new FormGroup({
            email: new FormControl(null, Validators.email),
            message: new FormControl(null, Validators.required),
            category: new FormControl(this.options[1].id, Validators.required)
            // ,draft: new FormControl(false)
        });

    }

    // blog ref: https://netbasal.com/understanding-the-comparefn-input-in-angular-v4-4a401ef4fc4c
    // the trackBy Input is for performance optimization, and the compareFn used to identify specific member
    compareFn(optionOne, optionTwo): boolean {
        return optionOne === optionTwo;
    }

    submit(e) {
        this.success = false;
        this.yp.ngrxStore.dispatch({
            type: EFFECT_CONTACT_US
        })
    }
}