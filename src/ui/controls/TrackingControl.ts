import { UIWidgetControl } from '@map/ui/controls/UIWidgetControl';

export class TrackingControl extends UIWidgetControl {

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.trackUserPosition &&
            this.UIManager.map.opt.uiControl?.trackingControl?.enabled
        ) {

            this.addChild( 'tracking', this.getUIBtn( {
                handler: this.handleTracking.bind( this ),
                icon: 'maker',
                activeIcon: 'marker-off',
                ariaLabel: 'Track Position'
            } ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_widget_box', '__apm_map__ui_btnBox', '__apm_map__ui_tracking' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {}

    private handleTracking () : void {}

    public update () : void { if ( this.isVisible() ) this.setChildrenAsContent() }

}
