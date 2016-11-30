import { Component } from '@angular/core';

@Component({
    selector: 'boilerplate',
    template: `
        <h1>Hello World</h1>
        <router-outlet></router-outlet>
    `,
    providers:[]
})
export class AppComponent {

    constructor(){
    }

}