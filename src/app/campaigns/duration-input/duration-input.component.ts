import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-duration-input',
  templateUrl: './duration-input.component.html',
  styleUrls: ['./duration-input.component.css']
})
export class DurationInputComponent implements OnInit {
  hours = 0;
  minutes = 0;
  seconds = 1;
  hoursOutput = "00";
  minutesOutput = "00";
  secondsOutput = "01";
  focus : any = "";

  constructor() { }

  ngOnInit() {
  }

  increment() {
    switch (this.focus) {
      case "hour":
        this.hours++;
        break;
      case "minute":
        this.minutes++;
        break;
      case "second":
        this.seconds++;
        break;
      default:
        break;
    }
    this.updateDisplay();
  }

  decrement() {

  }

  updateDisplay() {
    this.secondsOutput = this.padLeft(this.seconds);
    this.minutesOutput = this.padLeft(this.minutes);
    this.hoursOutput = this.padLeft(this.hours);
  }

  setFocus(field) {
    this.focus = field;
  }

  mouseDownIncrement() {
    this.increment();
    console.log('mouse down');
  }

  mouseDownDecrement() {
    console.log('mouse down also');
  }

  padLeft(n){
  	n=n.toString();
      n= "00".substring(0,2-n.length)+""+n.toString() ;
      n=n.substring(n.length-2);
      return n;
  }


}
