import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpModule }       from '@angular/http';
import { FormsModule }   from '@angular/forms';

import { AppComponent }     from './components/app.component';
import {TerrainComponent} from './components/terrain.component';
import {MinionsListComponent} from "./components/minions-list.component";
import {FooterComponent} from "./components/footer.component";
import {CodeEditorComponent} from "./components/code-editor.component";

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