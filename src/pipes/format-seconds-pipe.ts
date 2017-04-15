import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
    name: 'FormatSecondsPipe'
})
export class FormatSecondsPipe implements PipeTransform {
    transform(duration, ...args: any[]): any {
        var xdate = new XDate()
        return xdate.clearTime().addSeconds(duration).toString('HH:mm:ss');
    }
}