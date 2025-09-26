import { APMapEventType } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { BaseLayer } from '@map/layers/BaseLayer';
import { LayerGroup, LayerOptions } from 'leaflet';

export class LayerManager {

    private layers: Map< string, BaseLayer > = new Map ();
    private layerGroups: Map< string, LayerGroup > = new Map ();
    private defaultLayerGroup: LayerGroup;

    constructor ( private map: APMap ) {

        this.defaultLayerGroup = this.addGroup( '__default__' );

    }

    public getGroups () : string[] { return Object.keys( this.layerGroups ) }

    public addGroup ( groupName: string, options?: LayerOptions ) : LayerGroup {

        if ( ! this.layerGroups.has( groupName ) ) {

            this.layerGroups.set( groupName,
                new LayerGroup( [], options ).addTo( this.map.map )
            );

        }

        return this.layerGroups.get( groupName )!;

    }

    public removeGroup ( groupName: string ) : boolean {

        if ( ! this.layerGroups.has( groupName ) ) return false;

        this.layerGroups.get( groupName )!.removeFrom( this.map.map );
        this.layerGroups.delete( groupName );

        return true;

    }

    public getLayers () : BaseLayer[] { return Array.from( this.layers.values() ) }

    public getLayerById ( layerId: string ) : BaseLayer | undefined { return this.layers.get( layerId ) }

    public addLayer ( layer: BaseLayer ) : BaseLayer | false {

        if ( this.layers.has( layer.id ) ) return false;

        this.layers.set( layer.id, layer );

        this.setLayerVisibility( layer.id, layer.visible );

        this.map.dispatchEvent( 'layer-added' as APMapEventType, { layer } );

        return layer;

    }

    public removeLayer ( layerId: string ) : boolean {

        if ( ! this.layers.has( layerId ) ) return false;

        this.setLayerVisibility( layerId, false );

        this.layers.delete( layerId );

        this.map.dispatchEvent( 'layer-removed' as APMapEventType, { layerId } );

        return true;

    }

    public getLayersByGroup ( groupName: string ) : BaseLayer[] {

        return this.getLayers().filter( l => l.group === groupName );

    }

    public getVisibleLayers () : BaseLayer[] {

        return this.getLayers().filter( l => l.visible );

    }

    public getInteractiveLayers () : BaseLayer[] {

        return this.getLayers().filter( l => l.interactive );

    }

    public setLayerVisibility ( layerId: string, visible: boolean ) : boolean {

        const layer = this.getLayerById( layerId );

        if ( ! layer ) return false;
        if ( layer.visible === visible ) return true;

        const group = layer.group ? this.addGroup( layer.group ) : this.defaultLayerGroup;

        if ( visible ) {

            layer.layer.addTo( group );
            layer.visible = true;

        } else {

            group.removeLayer( layer.layer );
            layer.visible = false;

        }

        this.map.dispatchEvent( 'layer-toggled' as APMapEventType, { layerId, visible, layer } );

        return layer.visible;

    }

    public toggleLayerVisibility ( layerId: string ) : boolean {

        const layer = this.getLayerById( layerId );

        if ( ! layer ) return false;

        return this.setLayerVisibility( layerId, !! layer.visible );

    }

    public setGroupVisibility ( groupName: string, visible: boolean ) : void {

        const layers = this.getLayersByGroup( groupName );

        layers.forEach( l => this.setLayerVisibility( l.id, visible ) );

    }

}
