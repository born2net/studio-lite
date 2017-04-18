import {ChangeDetectorRef, Component, Input} from "@angular/core";
import {Http} from "@angular/http";
import * as _ from 'lodash';
import {Observable} from "rxjs/Observable";
import {Compbaser} from "ng-mslib";
import {RedPepperService} from "../../services/redpepper.service";
import {Lib} from "../../Lib";
import {LiveLogModel} from "../../models/live-log-model";
import {ACTION_LIVELOG_UPDATE} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    selector: 'storage-used',
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
export class StorageUsed extends Compbaser {
    _options;
    _chart: any;
    _ready = false;


    constructor(private yp: YellowPepperService, private cd:ChangeDetectorRef, private rp:RedPepperService) {
        super();
        var totalCapacity = this.rp.getUserData().resellerID == 1 ? 1000 : 25000;
        var gigs = totalCapacity / 1000 + 'GB';
        var bytesTotal = 0;
        this.rp.getResources().forEach((recResources)=>{
            if (recResources['change_type'] != 3)
                bytesTotal = bytesTotal + parseInt(recResources['resource_bytes_total']);
        });
        var used = Lib.ParseToFloatDouble((Math.ceil(bytesTotal / 1000000) / totalCapacity) * 100);
        var free = 100 - used;

        // if (String(mbTotalPercentRounded).length == 1 && String(mbTotalPercentRounded) != '0')
        //     mbTotalPercentRounded = '0' + mbTotalPercentRounded;
        // console.log(`Used %${mbTotalPercentRounded} of ${gigs}gb` );
        this._options = {
            chart: {
                type: 'pie',
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
                    text: 'average response time'
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
            series: [{
                name: 'cloud storage',
                colorByPoint: true,
                data: [{
                    name: '% storage used',
                    y: used
                }, {
                    name: '% storage free',
                    y: free,
                    sliced: true,
                    selected: true
                }]
            }]
        };
        this._ready = true;
    }

    saveInstance(chartInstance) {
        this._chart = chartInstance;
        this.cd.markForCheck();

    }

    // public serverStatus() {
    //     this.cancelOnDestroy(
    //         Observable.interval(2000)
    //             .startWith(0)
    //             .switchMap(() =>
    //                 this._http.get(`https://secure.digitalsignage.com/msPingServersGuest`)
    //                     .map(result => {
    //                         this._ready = true;
    //                         this.cd.markForCheck();
    //                         result = result.json();
    //                         var avg = 0, t = 0;
    //                         _.forEach(result, (stats) => {
    //                             t++;
    //                             avg = Number(stats) + avg;
    //                         });
    //                         if (!this._chart)
    //                             return 0;
    //                         return avg / t;
    //                     })
    //             )
    //             .subscribe((value) => {
    //                 if (!this._chart)
    //                     return;
    //                 var series = this._chart.series[0],
    //                     shift = series.data.length > 20;
    //                 this._chart.series[0].addPoint(value, true, shift);
    //             }, (e) => console.error(e))
    //     );
    // }
}