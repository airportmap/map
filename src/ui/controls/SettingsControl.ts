import { UIWidgetControl } from '@map/ui/controls/UIWidgetControl';

export class SettingsControl extends UIWidgetControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.settingsControl?.enabled ) {

            this.addChild( 'settings', this.getUIBtn( this.handleSettings.bind( this ), 'cog', 'close' ) );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_widget_box', '__apm_map__ui_settings' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {}

    private handleSettings () : void {}

    public update () : void { if ( this.isVisible() ) this.setChildrenAsContent() }

}
