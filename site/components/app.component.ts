import { Component } from '@angular/core';
import {BoundariesUtils} from "../objects/boundaries-utils";

@Component({
    selector: 'boilerplate',
    template: `
        <h1 style="text-align: center;margin-top:25px">CodeInCode</h1>
        <terrain [style.width]="getWidth()"
                [style.height]="getHeight()"></terrain>
        <sidebar></sidebar>
    `
})
export class AppComponent {

    constructor(){
    }

    getHeight(){
        return BoundariesUtils.getTerrainHeight()*BoundariesUtils.getMinionSize();
    }

    getWidth(){
        return BoundariesUtils.getTerrainWidth()*BoundariesUtils.getMinionSize();
    }
}