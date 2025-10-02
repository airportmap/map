import { APMapUIBntOptions } from '@airportmap/types';
import { UIManager } from '@map/ui/UIManager';

export abstract class UIControl {

    protected static ICON ( icon: string, classes: string = '' ) : string {

        return `<svg class="___icon {CLASS}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <use xlink:href="/assets/images/icons.svg#{ICON}"></use>
        </svg>`.replace( '{CLASS}', classes ).replace( '{ICON}', icon );

    };

    protected element: HTMLElement | undefined;
    protected childElements: Map< string, HTMLElement > = new Map();

    protected get parent () : HTMLElement { return this.UIManager.pane }

    public get el () : HTMLElement | undefined { return this.element }
    public get empty () : boolean { return ! this.element || this.element.childNodes.length === 0 }

    constructor ( protected UIManager: UIManager ) {

        if ( this.element = this.createUIControls() ) {

            this.parent.appendChild( this.element );
            this.initEventHandlers();
            this.update();

        }

    }

    protected clearChildren () : void { this.childElements.clear() }

    protected addChild ( key: string, node: HTMLElement ) : void { this.childElements.set( key, node ) }

    protected getChild< T extends HTMLElement > ( key: string ) : T | undefined {

        return this.childElements.get( key ) as T | undefined;

    }

    protected setChildrenAsContent ( clear: boolean = true ) : void {

        this.setContent( Array.from( this.childElements.values() ), clear );

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
        box.classList.add( '__apm_map__ui_txtBox' );

        return box;

    }

    protected getUIBtn ( options: APMapUIBntOptions ) : HTMLButtonElement {

        const { handler, icon, activeIcon, ariaLabel = 'Button', classes = [] } = options;

        const btn = document.createElement( 'button' );
        btn.innerHTML = UIControl.ICON( icon );
        btn.classList.add( '__apm_map__ui_btn', ...classes );
        btn.ariaLabel = ariaLabel;

        btn.addEventListener( 'click', ( e ) => handler( e ) );

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
