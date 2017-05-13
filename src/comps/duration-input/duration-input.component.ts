import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

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
    focus = "second";
    focusedItem;
    timer;
    duration = 0;
    prevDuration = 0;

    @Input()
    set setDuration(i_duration: number) {
        i_duration = Math.round(i_duration);
        if (this.duration == i_duration || i_duration == -1) return;
        console.log(`>>>>>>>> setting new duration old ${this.duration} > ${i_duration}`);
        this.duration = i_duration;
        this.calcSeconds();
        this.updateDisplay();
    }

    @Output() durationChange = new EventEmitter<Object>();

    constructor() {
    }

    ngOnInit() {
        document.body.onmouseup = () => {
            clearInterval(this.timer);
        }
        this.calcSeconds();
        this.updateDisplay();
    }

    calcSeconds() {
        var totalSeconds = this.duration;
        this.hours = Math.floor(totalSeconds / 3600);
        totalSeconds -= this.hours * 3600;
        this.minutes = Math.floor(totalSeconds / 60);
        totalSeconds -= this.minutes * 60;
        this.seconds = totalSeconds;
    }

    increment() {
        // console.log('increment');
        if (this.focusedItem) {
            this.focusedItem.focus();
        }
        switch (this.focus) {
            case "hour":
                ++this.hours;
                break;
            case "minute":
                ++this.minutes;
                break;
            case "second":
                ++this.seconds;
                break;
            default:
                break;
        }
        if (this.seconds == 60) {
            this.seconds = 0;
            this.minutes++;
        }
        if (this.minutes == 60) {
            this.minutes = 0;
            this.hours++;
        }
        if (this.hours > 24) {
            this.hours = 0;
        }
        this.updateDisplay();
    }

    decrement() {
        // console.log('decrement');
        switch (this.focus) {
            case "hour":
                if (--this.hours < 0) {
                    this.hours = 24;
                }
                break;
            case "minute":
                if (this.minutes == 0 && this.hours == 0) break;
                if (--this.minutes == -1) {
                    this.minutes = 59;
                    this.hours--;
                }
                break;
            case "second":
                if (this.seconds == 0 && this.minutes == 0 && this.hours == 0) break;
                if (--this.seconds == -1) {
                    this.seconds = 59;
                    if (--this.minutes == -1) {
                        this.minutes = 59;
                        this.hours--;
                    }
                }
                break;
            default:
                break;
        }
        this.updateDisplay();
    }

    notifyChanges() {
        const newDuration = this.hours * 60 * 60 + this.minutes * 60 + this.seconds;
        if (newDuration != this.prevDuration) {
            this.prevDuration = newDuration;
            // console.log('change emitted ' + newDuration);
            this.durationChange.emit(newDuration);
        }

    }

    updateDisplay() {
        this.secondsOutput = this.padLeft(this.seconds);
        this.minutesOutput = this.padLeft(this.minutes);
        this.hoursOutput = this.padLeft(this.hours);
    }

    inputTime(e) {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        } else {

        }
    }

    keyUp(e) {
        this.seconds = +this.secondsOutput;
        this.minutes = +this.minutesOutput;
        this.hours = +this.hoursOutput;
        if (!this.hours) {
            this.hours = 0;
        }
        if (this.hours > 24) {
            this.hours = 24;
        }

        if (!this.minutes) {
            this.minutes = 0;
        }
        if (this.minutes > 59) {
            this.minutes = 59;
        }

        if (!this.seconds) {
            this.seconds = 0;
        }
        if (this.seconds > 59) {
            this.seconds = 59;
        }
        this.updateDisplay();
    }

    setFocus(event, field) {
        this.focus = field;
        this.focusedItem = event.target;
    }

    mouseDownIncrement() {
        this.increment();
        // this.timer = setInterval(() => this.increment(), 150);
    }

    mouseUpIncrement() {
        // clearInterval(this.timer);
    }

    mouseDownDecrement() {
        this.decrement();
        // this.timer = setInterval(() => this.decrement(), 150);
    }

    mouseUpDecrement() {
        clearInterval(this.timer);
    }

    padLeft(n) {
        n = n.toString();
        n = "00".substring(0, 2 - n.length) + "" + n.toString();
        n = n.substring(n.length - 2);
        return n;
    }


}
