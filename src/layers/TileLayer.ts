import { APMapTheme, APMapTileLayerOptions } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { TileLayer as LeafletTileLayer } from 'leaflet';

export class TileLayer extends BaseLayer< APMapTileLayerOptions > {

    constructor ( map: APMap, options: APMapTileLayerOptions ) {

        super( map, deepmerge( {
            url: '',
            subdomains: 'abc',
            tileSize: 256,
            detectRetina: true,
            crossOrigin: false
        }, options ) );

        this.setThemedURL();

    }

    protected createLeafletLayer () : LeafletTileLayer {

        return new LeafletTileLayer( this.options.url, this.options );

    }

    protected initEventHandlers () : void {

        this.map.addEventListener( 'theme-changed', this.setThemedURL.bind( this ) );

    }

    protected setThemedURL ( theme?: APMapTheme ) : void {

        if ( ( theme ??= this.map.opt.theme ) in ( this.options.themedURLs ?? {} ) ) {

            ( this.layer as LeafletTileLayer ).setUrl( this.options.themedURLs![ theme ]! );

        }

    }

}
