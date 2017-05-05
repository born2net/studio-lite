import { Component } from '@angular/core';

@Component({
	selector: 'daycounter',
	styleUrls: ['./daycounter.component.css'],
	templateUrl: './daycounter.component.html'
})
export class DaycounterComponent {
	intIncrement: any;
	intDecrement: any;
	currentFocus: string;
	hour: string;
	minute: string;
	second: string;

	constructor() {
		this.currentFocus = 'second';
		this.hour = '00';
		this.minute = '00';
		this.second = '01';
	}

	onEventIncrement(event: MouseEvent): void {
		if(event.type == 'mouseup') {
			clearInterval(this.intIncrement);
		}

		if(event.type == 'mousedown') {
			this.intIncrement = setInterval(this.increment.bind(this), 150);
		}
	}

	onEventDecrement(event: MouseEvent): void {
		if(event.type == 'mouseup') {
			clearInterval(this.intDecrement);
		}

		if(event.type == 'mousedown') {
			this.intDecrement = setInterval(this.decrement.bind(this), 150);
		}
	}

	setFocus( id: string ): void {
		this.currentFocus = id;
	}

	increment(): void {
		document.getElementById(this.currentFocus).focus();
		var hr = parseInt(this.hour);
		var min = parseInt(this.minute);
		var sec = parseInt(this.second);

		if( this.currentFocus == 'second' ) {
			sec++;

			if( sec == 60 ) {
				sec = 0;
				min++;

				if( min == 60 ) {
					min = 0;
					hr++;
				}
			}
		}
		else if( this.currentFocus == 'minute' ) {
			min++;
			if( min == 60 ) {
				min = 0;
				hr++;
			}
		}
		else if( this.currentFocus == 'hour' ) {
			hr++;
		}

		this.hour = this.padLeft(hr);
		this.minute = this.padLeft(min);
		this.second = this.padLeft(sec);

		this.validate();
	}


	decrement(): void {
		document.getElementById(this.currentFocus).focus();
		var hr = parseInt(this.hour);
		var min = parseInt(this.minute);
		var sec = parseInt(this.second);

		if( this.currentFocus == 'second' ) {
			if( hr == 0 && min == 0 && sec == 1 ) {
				return;
			}
			sec--;
			if( sec == -1 ) {
				sec = 59;
				min--;
				if(min == -1) {
					min = 59;
					hr--;
				}
			}
		}
		else if( this.currentFocus == 'minute' ) {
			if( min == 0 && hr == 0 ){
				return;
			}
			min--;
			if( min == -1 ) {
				min = 59;
				hr--;
			}
		}
		else if(this.currentFocus == 'hour') {
			hr--;
		}

		this.hour = this.padLeft(hr);
		this.minute = this.padLeft(min);
		this.second = this.padLeft(sec);

		this.validate();
	}

	validate(): void {
		var val = this.currentFocus;

		if( isNaN(parseInt(val)) ) {
			(<HTMLInputElement>document.getElementById(this.currentFocus)).value = '00';
		}

		var hr = parseInt(this.hour);
		var min = parseInt(this.minute);
		var sec = parseInt(this.second);

		if( hr > 24 ){
			hr = 24;
		}
		if( hr < 0 ){
			hr = 0;
		}
		if( min < 0 ){
			min = 0;
		}
		if( min > 59 ){
			min = 59;
		}
		if( sec < 0 ){
			sec = 0;
		}
		if( sec > 59 ){
			sec = 59;
		}
		if( hr == 0 && min == 0 && sec == 0 ){
			sec = 1;
		}
		if( hr == 24 && (min > 0 || sec > 0) ){
			min = sec = 0;
		}

		this.hour = this.padLeft(hr);
		this.minute = this.padLeft(min);
		this.second = this.padLeft(sec);
	}

	padLeft(n: number): string {
		var tmpN = n.toString();
		tmpN = '00'.substring(0,2 - tmpN.length) + '' + tmpN.toString();
		tmpN = tmpN.substring(tmpN.length-2);
		return tmpN;
	}

}


/*
 Copyright 2017 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */