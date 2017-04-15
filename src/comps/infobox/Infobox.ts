import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChange} from '@angular/core'

@Component({
    selector: 'Infobox',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .panel-footer {
          padding: 5px 3px;
          background-color: #fafafa;
          border: 1px solid #e2e2e2;
          border-bottom-right-radius: 2px;
          border-bottom-left-radius: 2px;
        }
        .br-a {
            border: 1px solid #eeeeee !important;
        }
        .br-grey {
             border-color: #d9d9d9 !important;
        }
    `],
    template: `
              <div class="panel panel-tile text-center br-a br-grey">
                 <div *ngIf="value1 == null">
                    <br/>
                    <img src="assets/preload2.gif">
                    <br/>
                    <br/>
                 </div>
                 <div *ngIf="value1 != null">
                      <div>
                        <h1>{{value1}}</h1>
                        <h6 class="text-system">{{value2}}</h6>
                    </div>
                    <div class="panel-footer br-t p12">
                      <span class="fs11">
                        <i class="fa {{icon}} pr5"></i>
                        {{value3}}
                      </span>
                    </div>
                  </div>                
              </div>
    `
})
export class Infobox {
    @Input()
    style:string = 'basic'
    @Input()
    value1:string = null;
    @Input()
    value2:string = '';
    @Input()
    value3:string = '';
    @Input()
    icon:string = 'fa-plus';

}

