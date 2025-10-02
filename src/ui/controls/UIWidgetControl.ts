import { UIManager } from '@map/ui/UIManager';
import { UIControl } from '@map/ui/controls/UIControl';

export abstract class UIWidgetControl extends UIControl {

    protected override get parent () : HTMLElement { return this.UIManager.widget }

    constructor ( UIManager: UIManager ) { super ( UIManager ) }

}
