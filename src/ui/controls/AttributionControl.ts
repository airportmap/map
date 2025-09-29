import { UIControl } from '@map/ui/controls/UIControl';

export class AttributionControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.attributionControl?.enabled ) {

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_control', '__apm_map__ui_attribution' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {}

}
