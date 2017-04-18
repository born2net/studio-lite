import {ChangeDetectorRef, Component, Input} from "@angular/core";
import {Http} from "@angular/http";
import * as _ from 'lodash';
import {Observable} from "rxjs/Observable";
import {Compbaser} from "ng-mslib";

@Component({
    selector: 'server-avg',
    styles: [`
        chart {
            width: 100% !important;
            margin: 0 auto;
            display: block;
        }
    `],
    template: `
        <div style="width: 100%; height: 150px">
            <loading *ngIf="!_ready" [size]="'50px'" [style]="{'margin-top': '150px'}"></loading>
            <div style="width: 100%" *ngIf="_ready">
                <chart [options]="_options" (load)="saveInstance($event.context)">></chart>
            </div>
        </div>
    `
})
export class ServerAvg extends Compbaser {
    _options;
    _chart: any;
    _ready = false;

    constructor(private _http: Http, private cd:ChangeDetectorRef) {
        super();
        this.serverStatus();
        this._options = {
            chart: {
                type: 'spline',
                height: 228,
                borderColor: '#d9d9d9',
                borderWidth: 1,
                marginRight: 10,
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            align: 'center',
                            verticalAlign: 'bottom',
                            layout: 'horizontal'
                        },
                        yAxis: {
                            labels: {
                                align: 'left',
                                x: 0,
                                y: -5
                            },
                            title: {
                                text: null
                            }
                        },
                        subtitle: {
                            text: null
                        },
                        credits: {
                            enabled: false
                        }
                    }
                }]
            },
            title: {
                text: ''
            },

            xAxis: {
                labels: {
                    enabled: false
                },
                categories: []
            },
            credits: {
                enabled: false
            },
            yAxis: [{
                min: 0,
                title: {  
                    text: 'average cloud response'
                }
            }, {
                title: {
                    text: 'measured in milliseconds'
                },
                opposite: true
            }],
            legend: {
                enabled: false,
                shadow: false
            },
            tooltip: {
                shared: true
            },
            plotOptions: {
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: [{data: [0]}]
        };
    }

    saveInstance(chartInstance) {
        this._chart = chartInstance;
    }

    public serverStatus() {
        this.cancelOnDestroy(
            Observable.interval(2000)
                .startWith(0)
                .switchMap(() =>
                    this._http.get(`https://secure.digitalsignage.com/msPingServersGuest`)
                        .map(result => {
                            this._ready = true;
                            this.cd.markForCheck();
                            result = result.json();
                            var avg = 0, t = 0;
                            _.forEach(result, (stats) => {
                                t++;
                                avg = Number(stats) + avg;
                            });
                            if (!this._chart)
                                return 0;
                            return avg / t;
                        })
                )
                .subscribe((value) => {
                if (!this._chart)
                    return;
                    var series = this._chart.series[0],
                        shift = series.data.length > 20;
                    this._chart.series[0].addPoint(value, true, shift);
                }, (e) => console.error(e))
        );
    }
}