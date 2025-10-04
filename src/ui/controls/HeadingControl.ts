import { HeadingIndicator } from '@map/core/HeadingIndicator';
import { UIWidgetControl } from '@map/ui/controls/UIWidgetControl';
import { UIManager } from '@map/ui/UIManager';

export class HeadingControl extends UIWidgetControl {

    private headingIndicator: HeadingIndicator;

    constructor ( UIManager: UIManager ) {

        super( UIManager );

        const container = document.createElement( 'div' );
        container.classList.add( '__apm_map__ui_single', '__apm_map__ui_hdg' );
        this.UIManager.pane.appendChild( container );
        this.headingIndicator = new HeadingIndicator( container );

    }

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.enableDeviceOrientation &&
            this.UIManager.map.opt.uiControl?.headingControl?.enabled
        ) {

            this.addChild( 'hdg', this.getUIBtn( {
                handler: this.handleHdgToggle.bind( this ),
                icon: 'device-orientation',
                activeIcon: 'device-orientation-off',
                ariaLabel: 'Device Orientation'
            } ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_widget_box', '__apm_map__ui_btnBox', '__apm_map__ui_hdgControl' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'device-orientation-changed', this.update.bind( this ) );

    }

    protected handleHdgToggle () : void {

        const handler = this.UIManager.map.orientationHandler;

        if ( handler ) {

            handler.toggleAutoRotate();
            this.update();

        }

    }

    public update () : void {

        const handler = this.UIManager.map.orientationHandler;
        const hdg = this.getChild< HTMLButtonElement >( 'hdg' );

        if ( this.isVisible() && this.headingIndicator && handler && hdg ) {

            if ( this.empty ) this.setChildrenAsContent();

            if ( handler.isActive && handler.isAutoRotateEnabled ) {

                this.headingIndicator.update( handler.currentHeading );
                hdg.classList.add( '___active' );

            } else {

                this.headingIndicator.hide();
                hdg.classList.remove( '___active' );

            }

        }

    }

}
