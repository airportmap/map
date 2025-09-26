import { APMapEventType } from '@airportmap/types';
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

    public getLayers () : BaseLayer[] { return Array.from( this.layers.values() ) }

    public getLayerById ( layerId: string ) : BaseLayer | undefined { return this.layers.get( layerId ) }

    public addLayer ( layer: BaseLayer ) : BaseLayer {

        this.layers.set( layer.id, layer );

        this.map.dispatchEvent( 'layer-added' as APMapEventType, { layer } );

        return layer;

    }

    public removeLayer ( layerId: string ) : boolean {

        const layer = this.layers.get( layerId );

        if ( ! layer ) return false;

        this.layers.delete( layerId );

        this.map.dispatchEvent( 'layer-removed' as APMapEventType, { layerId } );

        return true;

    }

    public getLayersByGroup ( groupName: string ) : BaseLayer[] {

        return this.getLayers().filter( l => l.group === groupName );

    }

    public getVisibleLayers () : BaseLayer[] {

        return this.getLayers().filter( l => l.isVisible );

    }

    public setLayerVisibility ( layerId: string, visible: boolean ) : boolean {}

    public toggleLayerVisibility ( layerId: string ) : boolean | undefined {}

    public setGroupVisibility ( groupName: string, visible: boolean ) : boolean {}

    public toggleGroupVisibility ( groupName: string ) : boolean {}

}
