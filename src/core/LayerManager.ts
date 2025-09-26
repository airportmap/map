import { APMap } from '@map/core/APMap';
import { BaseLayer } from '@map/layers/BaseLayer';
import { LayerGroup } from 'leaflet';

export class LayerManager {

    private layers: Map< string, BaseLayer > = new Map ();
    private layerGroups: Map< string, LayerGroup > = new Map ();

    private defaultLayerGroup: LayerGroup;

    constructor ( private map: APMap ) {

        this.defaultLayerGroup = new LayerGroup().addTo( this.map.map );

    }

}
