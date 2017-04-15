import {ErrorHandler, Injectable, Injector} from '@angular/core';
import * as moment from 'moment'
import * as StackTrace from 'stacktrace-js';
import {Lib} from "../Lib";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector) {
    }

    handleError(error) {
        if (Lib.DevMode()){
            throw error;
        }

        // const loggingService = this.injector.get(LoggingService);
        // const location = this.injector.get(LocationStrategy);
        // const url = location instanceof PathLocationStrategy   ? location.path() : '';
        var message = error.message ? error.message : error.toString();
        var url = 'https://secure.digitalsignage.com/stacktrace/';

        // get the stack trace, lets grab the last 10 stacks only
        StackTrace.fromError(error).then(stackframes => {
            const stackString = stackframes
                .splice(0, 20)
                .map(function (sf) {
                    return sf.toString();
                }).join('\n');
            var date = moment().format('YYYY-MM-DD h:mm:ss');
            message = `error :: studioweb :: ${date} :: ${message}`
            StackTrace.report(stackString, url, message);
        });
        throw error;
    }

}