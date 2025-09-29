import { UIManager } from '@map/ui/UIManager';

export abstract class UIControl {

    protected element: HTMLElement | undefined;

    public get el () : HTMLElement | undefined { return this.element }

    constructor ( protected UIManager: UIManager ) {

        this.element = this.createUIControls();
        if ( this.element ) this.UIManager.pane.appendChild( this.element );

        this.initEventHandlers();

    }

    protected abstract createUIControls () : HTMLElement | undefined;

    protected abstract initEventHandlers () : void;

    public hasControl () : boolean { return !! this.element }

}
