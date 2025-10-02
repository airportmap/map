import { APMapUIControlGroup } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { UIControl } from '@map/ui/controls/UIControl';
import { AttributionControl } from '@map/ui/controls/AttributionControl';
import { StateControl } from '@map/ui/controls/StateControl';

export class UIManager {

    private UIControls: Partial< Record< APMapUIControlGroup, UIControl > > = {};
    private UIPane: HTMLElement;
    private UIWidget: HTMLElement;

    public get controls () : typeof this.UIControls { return this.UIControls }
    public get pane () : HTMLElement { return this.UIPane }
    public get widget () : HTMLElement { return this.UIWidget }

    constructor ( public map: APMap ) {

        this.UIPane = this.createUIPane();
        this.UIWidget = this.createUIWidget();
        this.initUIControls();

    }

    private createUIPane () : HTMLElement {

        const pane = document.createElement( 'div' );
        pane.classList.add( '__apm_map__ui' );

        const leafletControlContainer = this.map.el.querySelector( '.leaflet-control-container' );
        if ( leafletControlContainer ) leafletControlContainer.replaceWith( pane );

        return pane;

    }

    private createUIWidget () : HTMLElement {

        const widget = document.createElement( 'div' );
        widget.classList.add( '__apm_map__ui_widget' );

        this.pane.appendChild( widget );

        return widget;

    }

    private initUIControls () : void {

        this.UIControls.attributionControl = new AttributionControl( this );
        this.UIControls.stateControl = new StateControl( this );

    }

}
