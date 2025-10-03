import { HeadingIndicator } from '@map/core/HeadingIndicator';
import { UIControl } from '@map/ui/controls/UIControl';
import { UIManager } from '@map/ui/UIManager';

export class HeadingControl extends UIControl {

    private headingIndicator: HeadingIndicator;

    constructor ( UIManager: UIManager ) {

        super( UIManager );
        this.headingIndicator = new HeadingIndicator( this.element! );

    }

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.enableDeviceOrientation &&
            this.UIManager.map.opt.uiControl?.headingControl?.enabled
        ) {

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_single', '__apm_map__ui_hdg' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'device-orientation-changed', this.update.bind( this ) );

    }

    public update () : void {

        if (
            this.isVisible() && this.headingIndicator &&
            this.UIManager.map.orientationHandler?.isActive
        ) {

            const hdg = this.UIManager.map.orientationHandler!.currentHeading ?? 0;
            console.log( hdg );

        }

    }

}
