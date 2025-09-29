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

        this.UIManager.map.addEventListener( 'position-changed', this.update.bind( this ) );
        this.UIManager.map.addEventListener( 'zoom-changed', this.update.bind( this ) );

    }

    public update () : void {

        if ( this.isVisible() ) {

            const ratio = this.UIManager.map.units.getScaleRatio();
            const coords = this.UIManager.map.units.coords();

            this.element!.innerHTML = `${ ratio } @ ${ coords }`;

        }

    }

}
