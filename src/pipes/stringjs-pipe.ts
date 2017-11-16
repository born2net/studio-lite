/**
 *
 * Usage:
 *
 * var someVar = 'Hello world';
 *
 * public stringJSPipeArgs = {
        padLeft: [20,'LEFT'],
        padRight: [50,'RIGHT'],
        humanize: [],
        replaceAll: ['customers','Sean']
    }
 *
 * <h5>{{someVar | StringJSPipe:stringJSPipeArgs}}</h5>
 */

import {
    Pipe,
    PipeTransform
} from '@angular/core';
@Pipe({
    name: 'StringJSPipe'
})
export class StringJSPipe implements PipeTransform {
    transform(input: string, ...args: any[]): any {
        var execs = args[0];
        for (var methodName in execs) {
            var params = execs[methodName];
            input = StringJS(input)[methodName](...params);
            if (input['s'])
                input = input['s'];
        }
        return input;
    }
}