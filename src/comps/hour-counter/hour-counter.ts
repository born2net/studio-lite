import {Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, Input} from "@angular/core";
import {Compbaser} from "ng-mslib";

@Component({
    selector: 'hour-counter',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input #hour type="text" name="hour" id="hour" value="00" (focus)="setFocus('hour')" (keyup)="validate()">
        <input #minute type="text" name="minute" id="minute" value="00" (focus)="setFocus('minute')" (keyup)="validate()">
        <input #second type="text" name="second" id="second" value="01" (focus)="setFocus('second')" (keyup)="validate()">
        <input #up type="button" name="increment" id="increment" value="+" (mousedown)="intIncrementStart()" (mouseup)="intIncrementEnd()">
        <input #down type="button" name="decrement" id="decrement" value="-" (mousedown)="intDecrementStart()" (mouseup)="intDecrementEnd()">

        <!--<input type="button" name="increment" id="increment" value="+" onmousedown="intIncrement=setInterval(increment,80)" onmouseup="clearInterval(intIncrement)">-->
        <!--<input type="button" name="decrement" id="decrement" value="-" onmousedown="intDecrement=setInterval(decrement,80)" onmouseup="clearInterval(intDecrement)">-->

    `,
})
export class HourCounter {

    constructor(private el: ElementRef) {
        document.body.onmouseup = () => {
            clearInterval(this.intIncrement);
            clearInterval(this.intDecrement);
        }

    }

    @ViewChild('hour')
    inputHour;

    @ViewChild('minute')
    inputMinute:ElementRef;

    @ViewChild('second')
    inputSeconds:ElementRef;

    @ViewChild('up')
    up:ElementRef;

    @ViewChild('down')
    down:ElementRef;



    intIncrement;
    intDecrement;
    currentFocus = 'second';

    setFocus(id) {
        this.currentFocus = id;
        this.inputHour.nativeElement.value;
    }

    intIncrementStart() {
        setInterval(this.increment,80);
    }

    intIncrementEnd() {
        clearInterval(this.intIncrement);
    }

    intDecrementStart() {
        setInterval(this.decrement,80)
    }

    intDecrementEnd() {
        clearInterval(this.intDecrement)
    }

    increment() {
        // document.getElementById(this.currentFocus).focus();
        var hr = this.inputHour.nativeElement.value;
        var min = this.inputMinute.nativeElement.value;
        var sec = this.inputSeconds.nativeElement.value;
        // var hr = document.getElementById('hour').value;
        // var min = document.getElementById('minute').value;
        // var sec = document.getElementById('second').value;
        // if (this.currentFocus == "second") {
        //
        //     sec++;
        //
        //     if (sec == 60) {
        //         sec = 0;
        //         min++;
        //         if (min == 60) {
        //             min = 0;
        //             hr++;
        //         }
        //     }
        //
        // }
        // else if (this.currentFocus == "minute") {
        //     min++;
        //     if (min == 60) {
        //         min = 0;
        //         hr++;
        //     }
        // }
        // else if (this.currentFocus == "hour") {
        //     hr++;
        // }
        // document.getElementById('hour').value = this.padLeft(hr);
        // document.getElementById('minute').value = this.padLeft(min);
        // document.getElementById('second').value = this.padLeft(sec);
        // this.validate();
    }

    decrement() {
        // document.getElementById(this.currentFocus).focus();
        // var hr = document.getElementById('hour').value;
        // var min = document.getElementById('minute').value;
        // var sec = document.getElementById('second').value;
        // if (this.currentFocus == "second") {
        //     if (hr == 0 && min == 0 && sec == 1) {
        //         return;
        //     }
        //     sec--;
        //     if (sec == -1) {
        //         sec = 59;
        //         min--;
        //         if (min == -1) {
        //             min = 59;
        //             hr--;
        //         }
        //     }
        // }
        // else if (this.currentFocus == "minute") {
        //     min--;
        //     if (min == -1) {
        //         min = 59;
        //         hr--;
        //     }
        // }
        // else if (this.currentFocus == "hour") {
        //     hr--;
        // }
        // document.getElementById('hour').value = padLeft(hr);
        // document.getElementById('minute').value = padLeft(min);
        // document.getElementById('second').value = padLeft(sec);
        // this.validate();
    }


    padLeft(n) {
        n = n.toString();
        n = "00".substring(0, 2 - n.length) + "" + n.toString();
        n = n.substring(n.length - 2);
        return n;
    }

    validate() {
        // var val = document.getElementById(this.currentFocus).value;
        // if (isNaN(val)) {
        //     document.getElementById(this.currentFocus).value = "00";
        // }
        // var hr = document.getElementById('hour').value;
        // var min = document.getElementById('minute').value;
        // var sec = document.getElementById('second').value;
        // if (hr > 24)
        //     hr = 24;
        // if (hr < 0)
        //     hr = 0;
        // if (min < 0)
        //     min = 0;
        // if (min > 59)
        //     min = 59;
        // if (sec < 0)
        //     sec = 0;
        // if (sec > 59)
        //     sec = 59;
        // document.getElementById('hour').value = this.padLeft(hr);
        // document.getElementById('minute').value = this.padLeft(min);
        // document.getElementById('second').value = this.padLeft(sec);
    }
}
