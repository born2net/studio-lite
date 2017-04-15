import {Pipe, PipeTransform} from '@angular/core';
import {Map, List} from 'immutable';
import {StoreModel} from "../store/model/StoreModel";
@Pipe({
    name: 'ListToArrayPipe'
})
export class ListToArrayPipe implements PipeTransform {
    transform(items: List<StoreModel>, ...args: any[]): any {
        var arr = items.toArray();
        return arr;
    }
}