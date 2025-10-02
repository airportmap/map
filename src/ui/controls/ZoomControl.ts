import { UIWidgetControl } from '@map/ui/controls/UIWidgetControl';

export class ZoomControl extends UIWidgetControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.zoomControl?.enabled ) {

            this.addChild( 'zoomIn', this.getUIBtn( this.handleZoomIn.bind( this ), 'plus' ) );
            this.addChild( 'zoomOut', this.getUIBtn( this.handleZoomOut.bind( this ), 'minus' ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_widget_box', '__apm_map__ui_zoom' );

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

        const zoomIn = this.getChild< HTMLButtonElement >( 'zoomIn' );
        const zoomOut = this.getChild< HTMLButtonElement >( 'zoomOut' );

        if ( this.isVisible() && zoomIn && zoomOut ) {

            const zoom = this.UIManager.map.zoom;

            zoomIn.disabled = zoom === this.UIManager.map.map.getMaxZoom();
            zoomOut.disabled = zoom === this.UIManager.map.map.getMinZoom();

            if ( this.empty ) this.setChildrenAsContent();

        }

    }

}
