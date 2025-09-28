import { APMapTileLayerOptions } from '@airportmap/types';
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

    }

    protected createLeafletLayer () : LeafletTileLayer {

        return new LeafletTileLayer( this.options.url, this.options );

    }

    protected initEventHandlers () : void {}

}
