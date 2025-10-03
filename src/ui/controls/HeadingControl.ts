import { UIControl } from '@map/ui/controls/UIControl';

export class HeadingControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.enableDeviceOrientation &&
            this.UIManager.map.opt.uiControl?.headingControl?.enabled
        ) {

            const bug = document.createElement( 'div' );
            bug.classList.add( '__apm_map__ui_hdg__bug' );

            this.addChild( 'bug', bug );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_single', '__apm_map__ui_hdg' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'device-orientation-changed', this.update.bind( this ) );

    }

    public update () : void {

        //

    }

}
