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

    protected clearElement () : void {

        if ( ! ( this.element instanceof HTMLElement ) ) return;

        while ( this.element.firstChild ) this.element.removeChild( this.element.firstChild );

    }

    protected setContent ( nodes: HTMLElement[], clear: boolean = true ) : void {

        if ( clear ) this.clearElement();

        nodes.forEach( node => this.element!.appendChild( node ) );

    }

    protected getUIBox ( content?: string ) : HTMLElement {

        const el = document.createElement( 'div' );

        el.innerHTML = content ?? '';
        el.classList.add( '__apm_map__ui_box' );

        return el;

    }

    protected abstract createUIControls () : HTMLElement | undefined;

    protected abstract initEventHandlers () : void;

    public abstract update () : void;

    public hasControl () : boolean { return !! this.element }

    public isVisible () : boolean { return !! this.element && ! this.element.classList.contains( 'hidden' ) }

    public show () : void { this.el?.classList.remove( 'hidden' ), this.update() }

    public hide () : void { this.el?.classList.add( 'hidden' ) }

}
