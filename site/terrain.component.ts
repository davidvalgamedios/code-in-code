import { Component } from '@angular/core';
import {TerrainService} from "./terrain.service";
import {Minion} from "./minion";

@Component({
    selector: 'terrain',
    template: `
        <div class="minion" *ngFor="let mn of minionList"
            (click)="selectMinion(mn)"
            [style.top]="mn.getY()"
            [style.left]="mn.getX()"><div class="eye"></div>
        </div>
        
        <code-footer (notify)="closeFooter($event)" [selectedMinion]="selectedMinion"></code-footer>
    `,
    providers:[TerrainService]
})
export class TerrainComponent {
    minionList:Minion[];

    private selectedMinion:Minion;

    constructor(private terrainService:TerrainService){
        this.minionList = this.terrainService.getMinionList();
    }

    closeFooter(msg:string){
        this.selectedMinion = null;
    }

    selectMinion(minion:Minion){
        this.selectedMinion = minion;
    }
}