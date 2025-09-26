import { APMapLayerOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';
import { Layer as LeafletLayer } from 'leaflet';

export abstract class BaseLayer {

    protected options: Required< APMapLayerOptions >;
    protected visible: boolean;
    protected leafletLayer: LeafletLayer;

    public get id () : string { return this.options.id }
    public get name () : string { return this.options.name }
    public get description () : string | undefined { return this.options.description }
    public get group () : string | undefined { return this.options.group }
    public get isVisible () : boolean { return this.visible }
    public get minZoom () : number { return this.options.minZoom }
    public get maxZoom () : number { return this.options.maxZoom }
    public get performanceImpact () : 'low' | 'medium' | 'high' { return this.options.performanceImpact }
    public get interactive () : boolean { return this.options.interactive }
    public get opacity () : number { return this.options.opacity }
    public get attribution () : string | undefined { return this.options.attribution }
    public get pane () : string | undefined { return this.options.pane }

    constructor ( options: APMapLayerOptions ) {

        this.options = this.mergeDefaultOptions( options );
        this.visible  = this.options.visible || false;

        this.leafletLayer = this.createLeafletLayer();
        this.initEventHandlers();

    }

    private mergeDefaultOptions ( options: APMapLayerOptions ) : Required< APMapLayerOptions > {

        return deepmerge< Required< APMapLayerOptions > >( {
            id: '',
            name: '',
            description: undefined,
            group: undefined,
            visible: false,
            minZoom: 0,
            maxZoom: Infinity,
            performanceImpact: 'low',
            interactive: true,
            opacity: 1,
            attribution: undefined,
            pane: undefined
        }, options );

    }

    protected abstract createLeafletLayer () : LeafletLayer;

    protected abstract initEventHandlers() : void;

    public abstract update () : void;

}
