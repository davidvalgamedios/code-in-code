import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Minion} from "../objects/minion";

@Component({
    selector: 'code-footer',
    template: `
        <div class="footer" [style.bottom]="selectedMinion?'0':'-150px'">
            <div class="close" (click)="closeFooter()"><i class="icon-cancel"></i></div>
            <div *ngIf="selectedMinion" class="footerContent">    
                <div class="errorsContainer">
                    <div *ngFor="let sErr of selectedMinion.lastErrors">
                        {{sErr}}
                    </div>
                </div>
                <div class="rightContent">
                    <div class="button" (click)="editMinionCode()">Editar código <i class="icon-code"></i></div>
                </div>
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
        this.selectedMinion.setPause(false);
        this.isEditingCode = false;
    }

    editMinionCode(){
        this.selectedMinion.setPause(true);
        this.isEditingCode = true;
    }
}