import { APMap } from '@map/core/APMap';

export class StateStorage {

    private readonly storageKey: string;
    private enabled: boolean;
    private restoreOnLoad: boolean;

    constructor( private map: APMap ) {

        const { enabled = false, restoreOnLoad = true, mapId = null } = this.map.opt.stateStorage;

        this.enabled = enabled;
        this.restoreOnLoad = restoreOnLoad;
        this.storageKey = `__apmap_state_${ mapId ?? 'default' }`;

    }

}
