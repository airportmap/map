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

    public getLayerById ( layerId: string ) : BaseLayer | undefined {}

    public addLayer ( layer: BaseLayer ) : BaseLayer {}

    public removeLayer ( layerId: string ) : boolean {}

    public getLayers () : BaseLayer[] { return Array.from( this.layers.values() ) }

    public getLayersByGroup ( groupName: string ) : BaseLayer[] {}

    public getVisibleLayers () : BaseLayer[] {}

    public setLayerVisibility ( layerId: string, visible: boolean ) : boolean {}

    public toggleLayerVisibility ( layerId: string ) : boolean | undefined {}

    public setGroupVisibility ( groupName: string, visible: boolean ) : boolean {}

    public toggleGroupVisibility ( groupName: string ) : boolean {}

}
