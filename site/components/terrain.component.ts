import { Component } from '@angular/core';
import {TerrainService} from "../services/terrain.service";
import {Minion} from "../objects/minion";

@Component({
    selector: 'terrain',
    template: `
        <div class="minion" *ngFor="let mn of minionList"
            (click)="selectMinion(mn)"
            [ngClass]="{'selected':selectedMinion == mn}" 
            [style.top]="mn.getY()"
            [style.left]="mn.getX()">
                <div class="eye" [ngClass]="mn.getLookAt()"></div>
        </div>
        
        <code-footer (notify)="closeFooter($event)" [selectedMinion]="selectedMinion"></code-footer>
    `
})
export class TerrainComponent {
    minionList:Minion[];

    private selectedMinion:Minion;

    constructor(private terrainService:TerrainService){
        this.minionList = this.terrainService.getMinionList();
        setInterval(any=>{
            this.executeMinionCodes()
        }, 1000);
    }

    closeFooter(msg:string){
        this.selectedMinion.setPause(false);
        this.selectedMinion = null;
    }

    selectMinion(minion:Minion){
        minion.setPause(true);
        this.selectedMinion = minion;
    }

    executeMinionCodes(){
        this.minionList.forEach(mn => {
            mn.executeCode();
        });
    }
}