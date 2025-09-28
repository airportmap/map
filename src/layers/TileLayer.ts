import { APMapEventType, APMapTheme, APMapTileLayerOptions } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { TileLayer as LeafletTileLayer } from 'leaflet';

export class TileLayer extends BaseLayer< APMapTileLayerOptions > {

    protected readonly themedURL: Partial< Record< APMapTheme, string > > = {};

    constructor ( map: APMap, options: APMapTileLayerOptions ) {

        super( map, deepmerge( {
            url: '',
            subdomains: 'abc',
            tileSize: 256,
            detectRetina: true,
            crossOrigin: false
        }, options ) );

    }

    protected createLeafletLayer () : LeafletTileLayer {

        return new LeafletTileLayer( this.options.url, this.options );

    }

    protected initEventHandlers () : void {

        this.map.addEventListener( 'theme-changed' as APMapEventType, this.setThemedURL.bind( this ) );

    }

    protected setThemedURL ( theme?: APMapTheme ) : void {

        if ( ( theme ??= this.map.opt.theme ) in this.themedURL ) {

            ( this.layer as LeafletTileLayer ).setUrl( this.themedURL[ theme ]! );

        }

    }

}
