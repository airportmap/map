import { APMapTileLayerOptions } from '@airportmap/types';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { TileLayer as LeafletTileLayer } from 'leaflet';

export class TileLayer extends BaseLayer {

    private tileOptions: APMapTileLayerOptions;

    constructor ( options: APMapTileLayerOptions ) {

        super( options );

        this.tileOptions = this.mergeTileOptions( options );
        this.init();

    }

    private mergeTileOptions ( options: APMapTileLayerOptions ) : APMapTileLayerOptions {

        return deepmerge< APMapTileLayerOptions >( {
            url: '',
            subdomains: 'abc',
            tileSize: 256,
            detectRetina: true,
            crossOrigin: false
        }, options );

    }

    protected createLeafletLayer () : LeafletTileLayer {

        return new LeafletTileLayer( this.tileOptions.url, this.tileOptions );

    }

    protected initEventHandlers () : void {}

    public update () : this { return this }

}
