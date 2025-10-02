import { UIControl } from '@map/ui/controls/UIControl';

export class AttributionControl extends UIControl {

    protected createUIControls () : HTMLElement | undefined {

        if ( this.UIManager.map.opt.uiControl?.attributionControl?.enabled ) {

            this.addChild( 'attr', this.getUIBox() );

            const el = document.createElement( 'div' );
            el.classList.add( '__apm_map__ui_group', '__apm_map__ui_attribution' );

            return el;

        }

        return undefined;

    }

    protected initEventHandlers () : void {

        this.UIManager.map.addEventListener( 'layer-added', this.update.bind( this ) );
        this.UIManager.map.addEventListener( 'layer-removed', this.update.bind( this ) );
        this.UIManager.map.addEventListener( 'layer-toggled', this.update.bind( this ) );

    }

    public update () : void {

        const attr = this.getChild( 'attr' );

        if ( this.isVisible() && attr ) {

            let content = [ `Copyright ${ new Date().getFullYear() } <a href="https://airportmap.de/license">Airportmap</a>` ];

            this.UIManager.map.layer.getVisibleLayers().forEach(
                layer => layer.attribution && content.push( layer.attribution )
            );

            attr.innerHTML = content.join( ' | ' );

            if ( this.empty ) this.setChildrenAsContent();

        }

    }

}
