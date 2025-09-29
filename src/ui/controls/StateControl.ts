import { UIControl } from '@map/ui/controls/UIControl';

export class StateControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.stateControl?.enabled ) {

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_control', '__apm_map__ui_state' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        //

    }

    public update () : void {

        if ( this.isVisible() ) {

            //

        }

    }

}
