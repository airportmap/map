import { APMapTileLayerOptions } from '@airportmap/types';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { TileLayer as LeafletTileLayer } from 'leaflet';

export class TileLayer extends BaseLayer< APMapTileLayerOptions > {

    constructor ( options: APMapTileLayerOptions ) {

        super( deepmerge( {
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

    public update () : this { return this }

}
