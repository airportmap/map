import { APMap } from '@map/core/APMap';
import { TileLayer } from '@map/layers/TileLayer';

export class CartoTileLayer extends TileLayer {

    constructor ( map: APMap ) {

        super( map, {
            _id: '__tile_layer__carto__',
            group: '__tile_layer__',
            name: 'Carto Tile Layer',
            url: '',
            themedURLs: {
                light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
                dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            },
            subdomains: 'abcd',
            attribution: '<a href="https://openstreetmap.org/copyright">OSM</a> & <a href="https://carto.com/attributions">CARTO</a>',
            minZoom: 4,
            maxZoom: 15
        } );

    }

}
