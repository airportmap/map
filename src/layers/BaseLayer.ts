import { APMapLayerOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';
import { Layer as LeafletLayer } from 'leaflet';

export abstract class BaseLayer {

    protected options: APMapLayerOptions;
    protected visible: boolean;
    protected leafletLayer: LeafletLayer;

    constructor ( options: APMapLayerOptions ) {

        this.options = this.mergeDefaultOptions( options );
        this.visible = this.options.visible || false;
        this.leafletLayer = this.createLeafletLayer();

        this.initEventHandlers();

    }

    private mergeDefaultOptions ( options: APMapLayerOptions ) : APMapLayerOptions {

        return deepmerge< APMapLayerOptions >( {
            id: '',
            name: '',
            visible: false,
            minZoom: 0,
            maxZoom: Infinity,
            performanceImpact: 'low',
            interactive: true,
            opacity: 1
        }, options );

    }

    protected abstract createLeafletLayer () : LeafletLayer;

    protected abstract initEventHandlers() : void;

}
