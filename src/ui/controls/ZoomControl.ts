import { UIControl } from '@map/ui/controls/UIControl';

export class ZoomControl extends UIControl {

    protected override parent: 'pane' | 'widget' = 'widget';

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.zoomControl?.enabled ) {

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_group', '__apm_map__ui_zoom' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {}

    public update () : void {

        if ( this.isVisible() ) {}

    }

}
