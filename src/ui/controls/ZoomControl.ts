import { UIWidgetControl } from '@map/ui/controls/UIWidgetControl';

export class ZoomControl extends UIWidgetControl {

    private zoomIn?: HTMLButtonElement;
    private zoomOut?: HTMLButtonElement;

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.zoomControl?.enabled ) {

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_group', '__apm_map__ui_zoom' );

            this.zoomIn = this.getUIBtn( this.handleZoomIn, 'plus' );
            this.zoomOut = this.getUIBtn( this.handleZoomOut, 'minus' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'zoom-changed', this.update.bind( this ) );

    }

    private handleZoomIn () : void { this.UIManager.map.map.zoomIn() }

    private handleZoomOut () : void { this.UIManager.map.map.zoomOut() }

    public update () : void {

        if ( this.isVisible() && this.zoomIn && this.zoomOut ) {

            if ( this.empty ) this.setContent( [ this.zoomIn, this.zoomOut ] );

            const zoom = this.UIManager.map.zoom;
            this.zoomIn.disabled = zoom === this.UIManager.map.map.getMaxZoom();
            this.zoomOut.disabled = zoom === this.UIManager.map.map.getMinZoom();

        }

    }

}
