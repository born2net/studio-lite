import {Component, Input, Output, ChangeDetectionStrategy, HostListener, forwardRef, Inject, HostBinding, EventEmitter} from '@angular/core'
import {SimpleGridTable} from "./SimpleGridTable";

@Component({
    selector: 'tr[simpleGridRecord]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
          <ng-content></ng-content>
    `
})
export class SimpleGridRecord {

    // we have to Inject -> forwardRef as SimpleGridTable is not yet due to load order of files
    constructor(@Inject(forwardRef(() => SimpleGridTable)) i_table: SimpleGridTable){
        this.m_table = i_table;
    }

    private m_table:SimpleGridTable
    private m_index;

    @Input()
    item;

    @Input()
    selectable:boolean = true;

    // @Input()
    // set table(i_table) {
    //     this.m_table = i_table;
    // }

    @Output()
    onDoubleClicked:EventEmitter<any> = new EventEmitter();

    @Output()
    onClicked:EventEmitter<any> = new EventEmitter();

    @HostListener('dblclick', ['$event'])
    doubleClicked(event) {
        this.setSelected();
        this.onDoubleClicked.emit({
            target: event.target,
            item: this.item ? this.item : null
        });
        return true;
    }

    @HostListener('click', ['$event'])
    onSelected() {
        if (!this.selectable)
            return;
        this.setSelected();
        this.onClicked.emit({
            target: event.target,
            item: this.item ? this.item : null
        });
        return true;
    }

    @HostBinding('class.selectedTr')
    selectedClass:boolean = false;

    @Input()
    set index(i_index:number) {
        this.m_index = i_index;
    }

    get index() {
        return this.m_index;
    }

    ngOnInit() {
        var selected:SimpleGridRecord = this.m_table.getSelected();
        // even though the index is same as this, the Immutable data propSelectedModel
        // is out of sync inside table, so we need to update to latest version of this
        if (selected && selected.m_index == this.index)
            this.setSelected();
    }

    private setSelected() {
        this.m_table.setSelected(this);
        this.selectedClass = true;
    }
}