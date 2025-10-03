import { UIControl } from '@map/ui/controls/UIControl';

export class ScrollControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.mode === 'theater' &&
            this.UIManager.map.opt.uiControl?.scrollControl?.enabled
        ) {

            this.addChild( 'scroll', this.getUIBtn( {
                handler: this.handleScrollDown.bind( this ),
                icon: 'mouse', text: 'Scroll',
                ariaLabel: 'Scroll down'
            } ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_single', '__apm_map__ui_btnBox', '__apm_map__ui_scroll' );

            return el;

        }

        return undefined;

    }

    protected async handleScrollDown () : Promise< void > {

        try { await document.exitFullscreen() } catch {}
        window.scrollBy( { top: 480, behavior: 'smooth' } );

    }

    protected initEventHandlers () : void {}

    public update () : void { if ( this.isVisible() && this.empty ) this.setChildrenAsContent() }

}
