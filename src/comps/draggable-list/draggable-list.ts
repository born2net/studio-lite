import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, TemplateRef} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {List} from "immutable";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'draggable-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .dragch {
            float: right;
            padding-right: 10px;
            position: relative;
            top: 5px;
        }

        .lengthTimer {
            float: right;
            padding-right: 10px;
        }

        .listItems {
            cursor: pointer;
        }

        .listItems a i {
            display: inline;
            font-size: 40px;
            padding-right: 20px;
        }

        .listItems a span {
            display: inline;
            font-size: 1.5em;
            position: relative;
            top: -12px;
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <div>
            <div *ngIf="customTemplate">
                <div class="sortableList">
                    <li (click)="_onItemSelected(item, $event, i)" *ngFor="let item of m_items; let i = index" class="listItems list-group-item" [ngClass]="{'selectedItem': m_selectedIdx == i}">
                        <ng-template [ngTemplateOutlet]="customTemplate" [ngOutletContext]="{$implicit: item}">
                        </ng-template>
                    </li>
                </div>
            </div>
            <div *ngIf="!customTemplate">
                <div class="sortableList">
                    <li (click)="_onItemSelected(item, $event, i)" *ngFor="let item of m_items; let i = index" class=".listItems list-group-item" [ngClass]="{'selectedItem': m_selectedIdx == i}">
                        <a href="#">
                            {{item}}
                        </a>
                    </li>
                </div>
            </div>
        </div>
    `,
})
export class DraggableList extends Compbaser implements AfterViewInit {

    private m_draggables;
    private target;
    private y;

    constructor(private el: ElementRef) {
        super();
    }

    m_items: List<any>
    m_selectedIdx = -1;

    @Input() customTemplate: TemplateRef<Object>;

    @Input()
    set items(i_items: List<any>) {
        // this.m_selectedIdx = -1;
        this.m_items = i_items;
        this.createSortable();
    }

    public deselect() {
        this.m_selectedIdx = -1;
    }

    @Output()
    onDragComplete: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onItemSelected: EventEmitter<any> = new EventEmitter<any>();

    private _onItemSelected(item, event, i) {
        this.m_selectedIdx = i;
        this.onItemSelected.emit({item, event, i})
    }

    /**
     Create a draggable sortable list
     @method _createSortable
     @param {String} i_selector
     **/
    @timeout(300)
    public createSortable() {
        var self = this;

        var selector = '.sortableList';
        if (jQuery(selector).children().length == 0) return;
        var sortable = document.querySelector(selector);
        if (this.m_draggables) {
            this.m_draggables.forEach((drag) => {
                drag.kill()
            });
            // var a = Draggable.get(".sortableList");
            // var sortable = document.querySelector(selector);
            // var a = Draggable.get(sortable);
            // con(a);
            // Draggable.get(".sortableList").kill();
        }

        self.m_draggables = Draggable.create(sortable.children, {
            type: "y",
            bounds: sortable,
            dragClickables: true,
            edgeResistance: 1,
            onPress: self._sortablePress,
            onDragStart: self._sortableDragStart,
            onDrag: self._sortableDrag,
            liveSnap: self._sortableSnap,
            onDragEnd: function () {
                self.m_selectedIdx = -1;
                var t = this.target,
                    max = t.kids.length - 1,
                    newIndex = Math.round(this.y / t.currentHeight);
                newIndex += (newIndex < 0 ? -1 : 0) + t.currentIndex;
                if (newIndex === max) {
                    t.parentNode.appendChild(t);
                } else {
                    t.parentNode.insertBefore(t, t.kids[newIndex + 1]);
                }
                TweenLite.set(t.kids, {yPercent: 0, overwrite: "all"});
                TweenLite.set(t, {y: 0, color: ""});
                var items = jQuery('.sortableList', self.el.nativeElement).children();
                self.onDragComplete.emit(items)

                //_.each(self.m_draggables, function(i){
                //    this.enabled(false);
                //});
            }
        });
    }


    /**
     Sortable list on press
     @method _sortablePress
     **/
    _sortablePress() {
        var t = this.target,
            i = 0,
            child = t;
        while (child = child.previousSibling)
            if (child.nodeType === 1) i++;
        t.currentIndex = i;
        t.currentHeight = t.offsetHeight;
        t.kids = [].slice.call(t.parentNode.children); // convert to array
    }

    /**
     Sortable drag list on press
     @method _sortableDragStart
     **/
    _sortableDragStart() {
        TweenLite.set(this.target, {color: "#88CE02"});
    }

    /**
     Sortable drag list
     @method _sortableDrag
     **/
    _sortableDrag() {
        var t = this.target,
            elements = t.kids.slice(), // clone
            indexChange = Math.round(this.y / t.currentHeight),
            bound1 = t.currentIndex,
            bound2 = bound1 + indexChange;
        if (bound1 < bound2) { // moved down
            TweenLite.to(elements.splice(bound1 + 1, bound2 - bound1), 0.15, {yPercent: -100});
            TweenLite.to(elements, 0.15, {yPercent: 0});
        } else if (bound1 === bound2) {
            elements.splice(bound1, 1);
            TweenLite.to(elements, 0.15, {yPercent: 0});
        } else { // moved up
            TweenLite.to(elements.splice(bound2, bound1 - bound2), 0.15, {yPercent: 100});
            TweenLite.to(elements, 0.15, {yPercent: 0});
        }
    }

    /**
     snap to set rounder values
     @method _sortableSnap
     **/
    _sortableSnap(y) {
        return y;
        // enable code below to enable snapinnes on dragging
        // var h = this.target.currentHeight;
        // return Math.round(y / h) * h;
    }

    ngAfterViewInit() {


    }

    ngOnInit() {
    }

    destroy() {
        if (this.m_draggables) {
            this.m_draggables.forEach((drag) => {
                drag.kill()
            });
        }
        this.m_draggables = null;
    }
}