import { UIControl } from '@map/ui/controls/UIControl';

export class StateControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.stateControl?.enabled ) {

            this.addChild( 'scale', this.getUIBox() );
            this.addChild( 'coords', this.getUIBox() );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_group', '__apm_map__ui_state' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'position-changed', this.update.bind( this ) );
        this.UIManager.map.addEventListener( 'zoom-changed', this.update.bind( this ) );

    }

    public update () : void {

        const scale = this.getChild( 'scale' );
        const coords = this.getChild( 'coords' );

        if ( this.isVisible() && scale && coords ) {

            const { label, pixels } = this.UIManager.map.geo.getScaleBar();

            scale.innerHTML = `${label} <span style="width: ${pixels}px;"></span>`;
            coords.innerHTML = this.UIManager.map.geo.getCoordinates();

            if ( this.empty ) this.setChildrenAsContent();

        }

    }

}
