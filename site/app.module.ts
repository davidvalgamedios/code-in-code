import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpModule }       from '@angular/http';
import { FormsModule }   from '@angular/forms';

import { AppComponent }     from './app.component';
import {TerrainComponent} from './terrain.component';
import {MinionsListComponent} from "./minions-list.component";
import {FooterComponent} from "./footer.component";
import {CodeEditorComponent} from "./code-editor.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule
    ],
    declarations: [ AppComponent, TerrainComponent, MinionsListComponent, FooterComponent, CodeEditorComponent],
    bootstrap:    [ AppComponent ]
})
export class AppModule {}