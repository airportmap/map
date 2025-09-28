import { APMap } from '@map/core/APMap';
import { TileLayer } from '@map/layers/TileLayer';

export class CartoTileLayer extends TileLayer {

    protected override readonly themedURL = {
        light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
    };

    constructor ( map: APMap ) {

        super( map, {
            _id: '__tile_layer__carto__',
            group: '__tile_layer__',
            name: 'Carto Tile Layer',
            url: '',
            subdomains: 'abcd',
            attribution: '<a href="https://openstreetmap.org/copyright">OSM</a> & <a href="https://carto.com/attributions">CARTO</a>',
            performanceImpact: 'low',
            minZoom: 4,
            maxZoom: 15
        } );

        this.setThemedURL();

    }

}
