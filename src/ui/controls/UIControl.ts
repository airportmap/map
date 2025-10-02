import { UIManager } from '@map/ui/UIManager';

export abstract class UIControl {

    protected static ICON ( icon: string, classes: string = '' ) : string {

        return `<svg class="___icon {CLASS}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <use xlink:href="/assets/images/icons.svg#{ICON}"></use>
        </svg>`.replace( '{CLASS}', classes ).replace( '{ICON}', icon );

    };

    protected element: HTMLElement | undefined;

    protected get parent () : HTMLElement { return this.UIManager.pane }

    public get el () : HTMLElement | undefined { return this.element }

    constructor ( protected UIManager: UIManager ) {

        if ( this.element = this.createUIControls() ) {

            this.parent.appendChild( this.element );
            this.initEventHandlers();
            this.update();

        }

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

        const box = document.createElement( 'div' );
        box.innerHTML = content ?? '';
        box.classList.add( '__apm_map__ui_box' );

        return box;

    }

    protected getUIBtn ( handler: CallableFunction, icon: string, activeIcon?: string ) : HTMLButtonElement {

        const btn = document.createElement( 'button' );
        btn.addEventListener( 'click', ( e ) => handler( e ) );
        btn.innerHTML = UIControl.ICON( icon );
        btn.classList.add( '__apm_map__ui_btn' );

        if ( activeIcon ) btn.innerHTML += UIControl.ICON( activeIcon, '___active' );

        return btn;

    }

    protected abstract createUIControls () : HTMLElement | undefined;

    protected abstract initEventHandlers () : void;

    public abstract update () : void;

    public hasControl () : boolean { return !! this.element }

    public isVisible () : boolean { return !! this.element && ! this.element.classList.contains( 'hidden' ) }

    public show () : void { this.el?.classList.remove( 'hidden' ), this.update() }

    public hide () : void { this.el?.classList.add( 'hidden' ) }

}
