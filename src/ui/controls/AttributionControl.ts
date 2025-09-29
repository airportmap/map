import { UIControl } from '@map/ui/controls/UIControl';

export class AttributionControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.attributionControl?.enabled ) {

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_control', '__apm_map__ui_attribution' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'layer-added', this.update.bind( this ) );
        this.UIManager.map.addEventListener( 'layer-removed', this.update.bind( this ) );
        this.UIManager.map.addEventListener( 'layer-toggled', this.update.bind( this ) );

    }

    public update () : void {

        if ( this.isVisible() ) {

            let attr = [ '© <a href="https://airportmap.de/license">Airportmap</a>' ];

            this.UIManager.map.layer.getVisibleLayers().forEach(
                layer => layer.attribution && attr.push( layer.attribution )
            );

            this.element!.innerHTML = attr.join( ' | ' );

        }

    }

}
