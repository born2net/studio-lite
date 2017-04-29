import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-timeline-ruler',
  templateUrl: './timeline-ruler.component.html',
  styleUrls: ['./timeline-ruler.component.css']
})
export class TimelineRulerComponent implements OnInit, OnChanges {
  @Input() width;
  @Input() height;
  @Input() scale : number = 1.0 / 10;
  @Input() position : number;

  canvas : any;
  ctx;

  constructor() { }

  ngOnInit() {


    this.drawScale();
  }

  ngOnChanges() {
    this.drawScale();
  }

  drawScale() {
    this.canvas = document.getElementById('ruler');
    this.ctx = this.canvas.getContext('2d');

        this.canvas.width = Math.min(1072, this.width);
        this.canvas.height = this.height;

        this.ctx.fillStyle = 'rgb(50, 50, 50)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        var minorStep = 10;
        var majorStep = 100;
        var minorLineHeight = 10;
        var majorLineHeight = 25;

        for (let i = -100; i <= this.width; i++) {
          this.ctx.fillStyle = 'rgb(250, 250, 250)';
          var realPosition = Number(this.position) + i;
          if (realPosition % majorStep == 0) { // draw major step
            this.ctx.fillRect(i, 50 - majorLineHeight, 1, majorLineHeight);
            var totalSeconds = realPosition * this.scale;
            var hours = Math.floor(totalSeconds / 60 / 60);
            var minutes = Math.floor((totalSeconds - (hours * 60 * 60)) / 60);
            var seconds = totalSeconds - hours * 60 * 60 - minutes * 60;

            var displayHours = hours,
                displayMinutes = minutes < 10 ? "0" + +minutes : minutes,
                displaySeconds = seconds < 10 ? "0" + +seconds : seconds;

            // draw text
            this.ctx.font = '12px verdana';
            this.ctx.fillText(`${displayHours}:${displayMinutes}:${displaySeconds}`, i, 15);
          } else if (realPosition % minorStep == 0) { // draw minor step

            this.ctx.fillRect(i, 50 - minorLineHeight, 1, minorLineHeight);
          }
        }
  }

}
