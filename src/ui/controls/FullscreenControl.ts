import { UIControl } from '@map/ui/controls/UIControl';

export class FullscreenControl extends UIControl {

    private fs: boolean = false;

    public get isFullscreen () : boolean { return this.fs }

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.allowFullscreen &&
            this.UIManager.map.opt.uiControl?.fullscreenControl?.enabled
        ) {

            this.addChild( 'fs', this.getUIBtn( this.handleFullscreen.bind( this ), 'fullscreen', 'fullscreen-exit' ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_group', '__apm_map__ui_fullscreen' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {}

    private handleFullscreen () : void {

        const el = this.UIManager.map.el;

        if ( ! this.fs && el.requestFullscreen ) el.requestFullscreen();
        else if ( document.exitFullscreen ) document.exitFullscreen();

        this.fs = document.fullscreenElement === el;

    }

    public update () : void {

        const fs = this.getChild< HTMLButtonElement >( 'fs' );

        if ( this.isVisible() && fs ) {

            this.setChildrenAsContent();

            if ( this.fs ) fs.classList.add( '___active' );
            else fs.classList.remove( '___active' );

        }

    }

}
