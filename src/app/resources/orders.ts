import {Component, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: 'orders',
    styles: [`
        .page {
            padding-left: 100px;
            padding-top: 40px;
        }
    `],
    template: `
               <Sliderpanel style="padding: 200px">
                  <div>
                    <Slideritem class="page center order1 selected" [toDirection]="'left'" [to]="'order2'">
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                      <h1>Order 1</h1>
                    </Slideritem>
                    <Slideritem class="page right order2" class="page right order2" [toDirection]="'left'" [fromDirection]="'right'" [from]="'order1'" [to]="'order3'">
                      <h1>Order 2</h1>
                    </Slideritem>
                    <Slideritem class="page right order3" [fromDirection]="'right'" [from]="'order2'" >
                      <h1>Order 3</h1>
                    </Slideritem>
                  </div>
                </Sliderpanel>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class Orders {
}

