import {Pipe, PipeTransform} from '@angular/core';
import {StoreModel} from "../store/model/StoreModel";
import * as _ from 'lodash';

@Pipe({
    name: 'FilterModelPipe'
})
export class FilterModelPipe implements PipeTransform {
    transform(model:StoreModel, ...args:any[]):boolean {
        if (_.isUndefined(args['0']) || _.isEmpty(args['0']))
            return false;
        try {
            var field = args[2];
            var str1:string = args[0].toLowerCase();
            var str2:string = model[field]().toLowerCase();
            if (str2.indexOf(str1) > -1)
                return false;
            return true;
        } catch (e) {
            return false;
        }
    }
}