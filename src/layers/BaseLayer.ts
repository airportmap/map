import { APMapLayerOptions } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import deepmerge from 'deepmerge';
import { Layer as LeafletLayer } from 'leaflet';

export abstract class BaseLayer< T extends APMapLayerOptions > {

    protected options: Required< T >;
    protected leafletLayer: LeafletLayer;

    public get id () : string { return this.options._id! }
    public get name () : string { return this.options.name! }
    public get description () : string | undefined { return this.options.description }
    public get group () : string | undefined { return this.options.group }
    public get minZoom () : number { return this.options.minZoom! }
    public get maxZoom () : number { return this.options.maxZoom! }
    public get performanceImpact () : 'low' | 'medium' | 'high' { return this.options.performanceImpact! }
    public get interactive () : boolean { return this.options.interactive! }
    public get opacity () : number { return this.options.opacity! }
    public get attribution () : string | undefined { return this.options.attribution }

    public set visible ( is: boolean ) { this.options.visible = is }
    public get visible () : boolean { return this.options.visible! }

    public get layer () : LeafletLayer { return this.leafletLayer }

    constructor ( protected map: APMap, options: APMapLayerOptions ) {

        this.options = this.mergeDefaultOptions( options );
        this.leafletLayer = this.createLeafletLayer();

        this.initEventHandlers();

    }

    private mergeDefaultOptions ( options: APMapLayerOptions ) : Required< T > {

        return deepmerge< Required< T > >( {
            _id: '',
            name: '',
            description: undefined,
            group: undefined,
            visible: false,
            minZoom: 0,
            maxZoom: Infinity,
            performanceImpact: 'low',
            interactive: true,
            opacity: 1,
            attribution: undefined
        } as any, options as any );

    }

    protected abstract createLeafletLayer () : LeafletLayer;

    protected abstract initEventHandlers() : void;

}
