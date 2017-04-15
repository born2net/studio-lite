import {Component, Input, Output, EventEmitter, ViewChildren, QueryList, ChangeDetectorRef} from "@angular/core";
import {List} from "immutable";
import {StoreModel} from "../../models/StoreModel";
import * as _ from "lodash";

@Component({
    selector: 'td[simpleGridDataChecks]',
    styles: [`
        i {
            cursor: pointer;
        }
        .slideMode {
            padding-top: 8px;
            padding-right: 20px;
        }
    `],
    template: `
        <div *ngIf="!slideMode">
            <div *ngFor="let item of m_checkboxes">
              <label class="pull-left">{{item.name}}</label>
              <Input (click)="onClick()" #checkInputs type="checkbox" [checked]="item" value="{{item}}" class="pull-left" style="margin-right: 2px">
            </div>
        </div>
        <div *ngIf="slideMode" class="slideMode">
            <div *ngFor="let item of m_checkboxes" class="material-switch pull-right">
              <Input id="{{m_checkId}}"(mouseup)="onClick()" (click)="onClick()" #checkInputs type="checkbox" [checked]="item" value="{{item}}" class="pull-left" style="margin-right: 2px">
              <label [attr.for]="m_checkId" class="label-primary"></label>
          </div>
        </div>
    `
})
export class SimpleGridDataChecks {
    constructor(private cdr: ChangeDetectorRef) {
    }

    m_checkId = _.uniqueId('slideCheck');
    m_checkboxes: List<any>
    private m_storeModel: StoreModel;

    @ViewChildren('checkInputs')
    inputs: QueryList<any>

    @Input()
    set checkboxes(i_checkboxes: List<any>) {
        this.m_checkboxes = i_checkboxes
    }

    @Input()
    set item(i_storeModel: StoreModel) {
        this.m_storeModel = i_storeModel
    }

    @Input()
    slideMode: boolean = false;

    @Output()
    changed: EventEmitter<any> = new EventEmitter();

    //@HostListener('click', ['$event'])
    private onClick(e) {
        this.cdr.detach();
        let values = []
        this.inputs.map(v => {
            values.push(v.nativeElement.checked);
        });
        this.changed.emit({item: this.m_storeModel, value: values});
        return true;
    }
}

