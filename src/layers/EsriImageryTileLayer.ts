import { APMap } from '@map/core/APMap';
import { TileLayer } from '@map/layers/TileLayer';

export class EsriImageryTileLayer extends TileLayer {

    constructor ( map: APMap ) {

        super( map, {
            _id: '__tile_layer__esriImagery__',
            group: '__tile_layer__',
            name: 'Esri Imagery Tile Layer',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '<a href="https://www.esri.com">Esri</a>, Source: i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
            minZoom: 0,
            maxZoom: 19
        } );

    }

}
