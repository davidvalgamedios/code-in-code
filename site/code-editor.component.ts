import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Minion} from "./minion";

@Component({
    selector: 'code-editor',
    template: `
        <div class="codeEditorContainer">
            <textarea spellcheck="false" class="codeEditor"></textarea>
            <div class="editorHelp">
                <div class="button" (click)="closeEditor()">Cerrar</div>
            </div>
        </div>
    `,
    providers:[]
})
export class CodeEditorComponent {
    @Input() selectedMinion:Minion;
    @Output() notify: EventEmitter<string> = new EventEmitter<string>();

    constructor(){
    }

    closeEditor(){
        this.notify.emit('Close');
    }

    editMinionCode(){

    }
}