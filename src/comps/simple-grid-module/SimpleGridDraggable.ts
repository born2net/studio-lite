import {
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Output,
    QueryList
} from "@angular/core";
import {SimpleGridTable} from "./SimpleGridTable";
import {timeout} from "../../decorators/timeout-decorator";
import {SimpleGridRecord} from "./SimpleGridRecord";
import {Subscription} from "rxjs";
import {StoreModel} from "../../models/StoreModel";
// import TweenLite = gsap.TweenLite;

export interface ISimpleGridDraggedData {
    newIndex: number;
    currentIndex: number;
    items: Array<any>;
}

@Directive({
    selector: 'tbody[simpleGridDraggable]'
})
export class SimpleGridDraggable {

    // we have to Inject -> forwardRef as SimpleGridTable is not yet due to load order of files
    constructor(@Inject(forwardRef(() => SimpleGridTable)) i_table: SimpleGridTable, private el: ElementRef) {
        this.m_table = i_table;
    }

    private m_table: SimpleGridTable
    private m_draggables;
    private target;
    private y;

    m_items;
    m_selectedIdx = -1;
    m_sub: Subscription;

    @ContentChildren(SimpleGridRecord) simpleGridRecords: QueryList<SimpleGridRecord>;

    @Output()
    dragCompleted: EventEmitter<ISimpleGridDraggedData> = new EventEmitter<ISimpleGridDraggedData>();

    ngAfterViewInit() {
        this.createSortable();
        this.m_sub = this.simpleGridRecords
            .changes.subscribe(v => {
                this.createSortable();
            });
    }

    _cleanSortables() {
        if (this.m_draggables)
            this.m_draggables.forEach((drag) => drag.kill());
    }

    /**
     Create a draggable sortable list
     **/
    @timeout(500)
    public createSortable() {
        var self = this;
        jQueryAny(self.el.nativeElement).children().each((i, child) => jQuery.data(child, "idx", i));
        this.simpleGridRecords.forEach((rec: SimpleGridRecord, i) => rec.index = i);

        if (jQuery(self.el.nativeElement).children().length == 0) return;
        this._cleanSortables();
        self.m_draggables = Draggable.create(jQuery(self.el.nativeElement).children(), {
            type: "y",
            bounds: self.el.nativeElement,
            dragClickables: false,
            edgeResistance: 1,
            onPress: self._sortablePress,
            onDragStart: self._sortableDragStart,
            onDrag: self._sortableDrag,
            liveSnap: self._sortableSnap,
            onDragEnd: function () {
                self.m_selectedIdx = -1;
                var t = this.target
                var max = t.kids.length - 1;
                var newIndex = Math.round(this.y / t.currentHeight);
                newIndex += (newIndex < 0 ? -1 : 0) + t.currentIndex;
                if (newIndex === max) {
                    t.parentNode.appendChild(t);
                } else {
                    t.parentNode.insertBefore(t, t.kids[newIndex + 1]);
                }
                var result:ISimpleGridDraggedData = {
                    items: [],
                    newIndex: newIndex < t.currentIndex ? newIndex + 1 : newIndex,
                    currentIndex: t.currentIndex
                };
                TweenLite.set(t.kids, {yPercent: 0, overwrite: "all"});
                TweenLite.set(t, {y: 0, color: ""});
                jQuery(self.el.nativeElement).children().each((i, child) => {
                    var oldIndex = jQuery.data(child, "idx");
                    var found: SimpleGridRecord = self.simpleGridRecords.find((rec: SimpleGridRecord) => {
                        return rec.index == oldIndex;
                    })
                    // con(i + ' ' + found.item.getKey('event'));
                    result.items.push(found.item)
                })
                self.dragCompleted.emit(result)
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

    ngOnDestroy() {
        this._cleanSortables();
        this.m_sub.unsubscribe();
        this.m_draggables = null;
    }
}