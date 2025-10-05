import { UIWidgetControl } from '@map/ui/controls/UIWidgetControl';

export class TrackingControl extends UIWidgetControl {

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.trackUserPosition &&
            this.UIManager.map.opt.uiControl?.trackingControl?.enabled
        ) {

            this.addChild( 'tracking', this.getUIBtn( {
                handler: this.handleTracking.bind( this ),
                icon: 'marker',
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

    private handleTracking () : void {

        const tracker = this.UIManager.map.locationTracker;

        if ( tracker.isTracking ) tracker.startTracking( { follow: true, highAccuracy: true } );
        else tracker.stopTracking();

        this.update();

    }

    public update () : void {

        const tracking = this.getChild< HTMLButtonElement >( 'tracking' );
        const tracker = this.UIManager.map.locationTracker;

        if ( this.isVisible() && tracking && tracker ) {

            if ( tracker.isTracking ) tracking.classList.add( '___active' );
            else tracking.classList.remove( '___active' );

            if ( this.empty ) this.setChildrenAsContent();

        }

    }

}
