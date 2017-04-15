import {trigger, state, animate, style, transition} from '@angular/core';

export function routerTransition() {
    return animateRoute();
}

function animateRoute() {
    return trigger('routerTransition', [
        state('*', style({opacity: 1})),
        transition('void => *', [
            style({opacity: 0}),
            animate(333)
        ]),
        transition('* => void', animate(333, style({opacity: 0})))
    ]);
}