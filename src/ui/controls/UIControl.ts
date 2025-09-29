import { UIManager } from '@map/ui/UIManager';

export abstract class UIControl {

    protected element: HTMLElement | undefined;

    public get el () : HTMLElement | undefined { return this.element }

    constructor ( protected UIManager: UIManager ) {

        if ( this.element = this.createUIControls() ) {

            this.UIManager.pane.appendChild( this.element );
            this.update();

        }

        this.initEventHandlers();

    }

    protected abstract createUIControls () : HTMLElement | undefined;

    protected abstract initEventHandlers () : void;

    public abstract update () : void;

    public hasControl () : boolean { return !! this.element }

    public isVisible () : boolean { return !! this.element && ! this.element.classList.contains( 'hidden' ) }

    public show () : void { this.el?.classList.remove( 'hidden' ) }

    public hide () : void { this.el?.classList.add( 'hidden' ) }

}
