import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpModule }       from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule }     from '@angular/router';

import { AppComponent }     from './app.component';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot([
            {
                path: '',
                component: AppComponent
            }
        ])
    ],
    declarations: [ AppComponent],
    bootstrap:    [ AppComponent ]
})
export class AppModule {}