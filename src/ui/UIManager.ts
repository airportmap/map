import { APMapUIControlGroup } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { UIControl } from '@map/ui/controls/UIControl';
import { AttributionControl } from '@map/ui/controls/AttributionControl';
import { StateControl } from '@map/ui/controls/StateControl';

export class UIManager {

    private UIControls: Partial< Record< APMapUIControlGroup, UIControl > > = {};
    private UIPane: HTMLElement;

    public get controls () : typeof this.UIControls { return this.UIControls }
    public get pane () : HTMLElement { return this.UIPane }

    constructor ( public map: APMap ) {

        this.UIPane = this.createUIPane();
        this.initUIControls();

    }

    private createUIPane () : HTMLElement {

        const pane = document.createElement( 'div' );
        pane.classList.add( '__apm_map__ui' );

        const leafletControlContainer = this.map.el.querySelector( '.leaflet-control-container' );
        if ( leafletControlContainer ) leafletControlContainer.replaceWith( pane );

        return pane;

    }

    private initUIControls () : void {

        this.UIControls.attributionControl = new AttributionControl( this );
        this.UIControls.stateControl = new StateControl( this );

    }

}
