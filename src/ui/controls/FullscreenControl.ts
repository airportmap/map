import { UIControl } from '@map/ui/controls/UIControl';

export class FullscreenControl extends UIControl {

    private fs: boolean = false;

    public get isFullscreen () : boolean { return this.fs }

    protected createUIControls () : HTMLElement | undefined {

        if (
            this.UIManager.map.opt.allowFullscreen &&
            this.UIManager.map.opt.uiControl?.fullscreenControl?.enabled
        ) {

            this.addChild( 'fs', this.getUIBtn( async () => await this.handleFullscreen(), 'fullscreen', 'fullscreen-exit' ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_single', '__apm_map__ui_btnBox', '__apm_map__ui_fullscreen' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        if ( this.UIManager.map.opt.allowFullscreen ) {

            document.addEventListener( 'fullscreenchange', () => {

                this.fs = document.fullscreenElement === this.UIManager.map.el;
                this.update();

            } );

            document.addEventListener( 'keydown', async ( e ) => {

                if ( e.key === 'F11' ) {

                    e.preventDefault();
                    await this.handleFullscreen();

                }

            } );

        }

    }

    private async handleFullscreen () : Promise< void > {

        const el = this.UIManager.map.el;

        if ( ! this.fs && el.requestFullscreen ) await el.requestFullscreen();
        else if ( document.exitFullscreen ) await document.exitFullscreen();

    }

    public update () : void {

        const fs = this.getChild< HTMLButtonElement >( 'fs' );

        if ( this.isVisible() && fs ) {

            if ( this.fs ) fs.classList.add( '___active' );
            else fs.classList.remove( '___active' );

            if ( this.empty ) this.setChildrenAsContent();

        }

    }

}
