import { APMapOptions, APMapEventType } from '@airportmap/types';
import { LocationTracker } from '@map/utils/LocationTracker';
import { OrientationHandler } from '@map/utils/OrientationHandler';
import { StateStorage } from '@map/utils/StateStorage';
import { URLHandler } from '@map/utils/URLHandler';
import deepmerge from 'deepmerge';
import { Map as LeafletMap, LatLngBounds } from 'leaflet';

export class APMap {

    private element: HTMLElement;
    private options: Required< APMapOptions >;
    private leafletMap: LeafletMap;
    private eventListeners: Map< string, Function[] > = new Map();

    private utils: {
        locationTracker?: LocationTracker,
        orientationHandler?: OrientationHandler,
        stateStorage?: StateStorage,
        urlHandler?: URLHandler
    } = {};

    public get opt () : Required< APMapOptions > { return this.options }
    public get map () : LeafletMap { return this.leafletMap }
    public get bounds () : LatLngBounds { return this.leafletMap.getBounds() }
    public get zoom () : number { return this.leafletMap.getZoom() }

    public get center () : { lat: number, lng: number } {

        const center = this.leafletMap.getCenter();

        return { lat: center.lat, lng: center.lng };

    }

    public get locationTracker () : LocationTracker | undefined { return this.utils.locationTracker }
    public get orientationHandler () : OrientationHandler | undefined { return this.utils.orientationHandler }
    public get stateStorage () : StateStorage | undefined { return this.utils.stateStorage }
    public get urlHandler () : URLHandler | undefined { return this.utils.urlHandler }

    constructor (
        element: HTMLElement,
        options?: APMapOptions
    ) {

        if ( ! element || ! ( element instanceof HTMLElement ) ) throw new Error (
            `Given element is not a valid HTML element or does not exists`
        );

        this.element = element;
        this.options = this.mergeDefaultOptions( options ?? {} );

        this.leafletMap = this.createMap();

        this.initUtils();

    }

    private mergeDefaultOptions ( options: APMapOptions ) : Required< APMapOptions > {

        return deepmerge< Required< APMapOptions > >( {
            mapOptions: {
                minZoom: 4,
                maxZoom: 16
            },
            mode: 'normal',
            allowFullscreen: true,
            urlManipulation: false,
            stateStorage: {
                enabled: false,
                restoreOnLoad: true,
                mapId: null
            },
            trackUserPosition: false,
            enableDeviceOrientation: false,
            showDayNightBoundary: false
        }, options );

    }

    private createMap () : LeafletMap {

        return new LeafletMap ( this.element, this.options.mapOptions );

    }

    private initUtils() : void {

        if ( this.options.stateStorage.enabled )
            this.utils.stateStorage = new StateStorage( this );

        if ( this.options.urlManipulation )
            this.utils.urlHandler = new URLHandler( this );

        if ( this.options.trackUserPosition )
            this.utils.locationTracker = new LocationTracker( this );

        if ( this.options.enableDeviceOrientation )
            this.utils.orientationHandler = new OrientationHandler( this );

    }

    public addEventListener ( event: APMapEventType, callback: Function ) : void {

        if ( ! this.eventListeners.has( event ) )
            this.eventListeners.set( event, [] );

        this.eventListeners.get( event )!.push( callback );

    }

    public removeEventListener ( event: APMapEventType, callback: Function ) : void {

        if ( ! this.eventListeners.has( event ) ) return;

        const listeners = this.eventListeners.get( event ) || [];
        const index = listeners.indexOf( callback );

        if ( index !== -1 ) listeners.splice( index, 1 );

    }

    public dispatchEvent ( event: APMapEventType, data: any ) : void {

        if ( ! this.eventListeners.has( event ) ) return;

        const listeners = this.eventListeners.get( event ) || [];
        listeners.forEach( callback => callback( data ) );

    }

    public setCenter ( lat: number, lng: number ) : void {

        this.leafletMap.setView( [ lat, lng ], this.leafletMap.getZoom() );

    }

    public setZoom ( zoom: number ) : void {

        this.leafletMap.setZoom( zoom );

    }

    public setView ( lat: number, lng: number, zoom: number ) : void {

        this.leafletMap.setView( [ lat, lng ], zoom );

    }

    public destroy () : void {

        this.leafletMap.remove();
        this.eventListeners.clear();

        this.utils.locationTracker?.destroy();
        this.utils.orientationHandler?.destroy();
        this.utils.urlHandler?.destroy();

    }

}
