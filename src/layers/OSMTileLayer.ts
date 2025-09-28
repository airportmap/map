import { APMap } from '@map/core/APMap';
import { TileLayer } from '@map/layers/TileLayer';

export class OSMTileLayer extends TileLayer {

    constructor ( map: APMap ) {

        super( map, {
            _id: '__tile_layer__osm__',
            group: '__tile_layer__',
            name: 'OSM Tile Layer',
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '<a href="https://openstreetmap.org/copyright">OSM</a>',
            performanceImpact: 'low',
            minZoom: 0,
            maxZoom: 19
        } );

    }

}
