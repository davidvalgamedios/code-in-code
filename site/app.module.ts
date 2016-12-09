import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpModule }       from '@angular/http';
import { FormsModule }   from '@angular/forms';

import { AppComponent }     from './components/app.component';
import {TerrainComponent} from './components/terrain.component';
import {SidebarComponent} from "./components/sidebar.component";
import {FooterComponent} from "./components/footer.component";
import {CodeEditorComponent} from "./components/code-editor.component";

import {TerrainService} from "./services/terrain.service";
import {CommonVariablesService} from "./services/common-variables.service";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule
    ],
    declarations: [ AppComponent, TerrainComponent, SidebarComponent, FooterComponent, CodeEditorComponent],
    bootstrap:    [ AppComponent ],
    providers: [TerrainService, CommonVariablesService]
})
export class AppModule {}