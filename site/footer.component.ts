import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Minion} from "./minion";

@Component({
    selector: 'code-footer',
    template: `
        <div class="footer" [style.bottom]="selectedMinion?'0':'-200px'">
            <div class="close" (click)="closeFooter()">X</div>
            <div *ngIf="selectedMinion">    
                <div class="button" (click)="editMinionCode()">Editar código</div>
                {{selectedMinion.getId()}}
            </div>
        </div>
        
        <code-editor *ngIf="isEditingCode" [selectedMinion]="selectedMinion" (notify)="closeEditor($event)"></code-editor>
    `,
    providers:[]
})
export class FooterComponent {
    isEditingCode:boolean = false;
    @Input() selectedMinion:Minion;
    @Output() notify: EventEmitter<string> = new EventEmitter<string>();

    constructor(){
    }

    closeFooter(){
        this.notify.emit('Close');
    }

    closeEditor(){
        this.isEditingCode = false;
    }

    editMinionCode(){
        this.isEditingCode = true;
    }
}