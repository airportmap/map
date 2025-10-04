import { APMapHdgOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';

export class HeadingIndicator {

    private options: Required<APMapHdgOptions>;
    private container: HTMLElement;
    private scale: HTMLElement;
    private center: HTMLElement;
    
    // Animation state
    private animationId: number | null = null;
    private currentHeading: number = 0;
    private targetHeading: number = 0;
    private currentCenterValue: number = 0;
    private targetCenterValue: number = 0;
    private animationSpeed: number = 0.1; // Adjust for faster/slower animation (0-1)

    constructor(el: HTMLElement, options?: APMapHdgOptions) {

        this.options = deepmerge<Required<APMapHdgOptions>>({
            labels: 'mixed',
            pxPerDeg: 6,
            majorStep: 15,
            minorStep: 5
        }, options ?? {});

        this.container = el;
        this.scale = this.initScale();
        this.center = this.initCenter();

        this.hide();
    }

    private normalize(angle: number): number { 
        return ((angle % 360) + 360) % 360;
    }

    private getCardinal(angle: number): string {
        return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(angle / 45) % 8];
    }

    private initScale(): HTMLElement {

        const { labels, pxPerDeg, majorStep, minorStep } = this.options;

        const width = 720 * pxPerDeg;
        const scale = document.createElement('div');
        scale.classList.add('__apm_map__ui_hdg_scale');
        scale.style.width = `${width}px`;
        this.container.appendChild(scale);

        for (let deg = -360; deg <= 720; deg += minorStep) {

            const tick = document.createElement('div');
            tick.className = 'tick ' + (deg % majorStep === 0 ? 'major' : 'minor');
            tick.style.left = `${deg * pxPerDeg}px`;

            if (deg % majorStep === 0) {

                const angle = this.normalize(deg);
                let label: string | undefined;

                if (labels === 'degrees') label = `${angle}°`;
                else if (labels === 'cardinal') label = this.getCardinal(angle);
                else label = (angle % 45 === 0) ? this.getCardinal(angle) : `${angle}°`;

                if (label) {

                    const lbl = document.createElement('span');
                    lbl.textContent = label;
                    tick.appendChild(lbl);
                }
            }

            scale.appendChild(tick);
        }

        return scale;
    }

    private initCenter(): HTMLElement {

        const center = document.createElement('div');
        center.classList.add('__apm_map__ui_txtBox', '__apm_map__ui_hdg_center');
        center.textContent = '—';
        this.container.appendChild(center);

        return center;
    }

    private getShortestRotation(from: number, to: number): number {
        // Calculate the shortest path between two angles
        const diff = to - from;
        
        if (diff > 180) {
            return diff - 360;
        } else if (diff < -180) {
            return diff + 360;
        }
        
        return diff;
    }

    private animate = (): void => {
        let needsUpdate = false;

        // Animate heading (scale position)
        const headingDiff = this.getShortestRotation(this.currentHeading, this.targetHeading);
        if (Math.abs(headingDiff) > 0.01) {
            this.currentHeading += headingDiff * this.animationSpeed;
            this.currentHeading = this.normalize(this.currentHeading);
            needsUpdate = true;
        } else {
            this.currentHeading = this.targetHeading;
        }

        // Animate center value
        const centerDiff = this.getShortestRotation(this.currentCenterValue, this.targetCenterValue);
        if (Math.abs(centerDiff) > 0.01) {
            this.currentCenterValue += centerDiff * this.animationSpeed;
            this.currentCenterValue = this.normalize(this.currentCenterValue);
            needsUpdate = true;
        } else {
            this.currentCenterValue = this.targetCenterValue;
        }

        // Update visual elements
        this.updateVisuals();

        // Continue animation if needed
        if (needsUpdate && this.container.classList.contains('hidden') === false) {
            this.animationId = requestAnimationFrame(this.animate);
        } else {
            this.animationId = null;
        }
    }

    private updateVisuals(): void {
        const { pxPerDeg } = this.options;
        const center = this.container.clientWidth / 2;
        
        // Use extended range to handle seamless wrapping
        let displayHeading = this.currentHeading;
        
        // Adjust display heading to stay within the -360 to 720 range for seamless display
        if (displayHeading < 0) displayHeading += 360;
        if (displayHeading >= 360) displayHeading -= 360;
        
        const offset = -(displayHeading * pxPerDeg) + center;
        
        this.scale.style.transform = `translateX(${offset}px)`;
        this.center.textContent = `${Math.round(this.currentCenterValue)}°`;
    }

    private startAnimation(): void {
        if (this.animationId === null && !this.container.classList.contains('hidden')) {
            this.animationId = requestAnimationFrame(this.animate);
        }
    }

    private stopAnimation(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    public update(hdg: number, centerValue?: number, instant: boolean = false): void {
        const normalizedHdg = this.normalize(hdg);
        const normalizedCenter = centerValue !== undefined ? this.normalize(centerValue) : normalizedHdg;

        if (instant) {
            // Instant update for gyroscope-like behavior
            this.currentHeading = normalizedHdg;
            this.targetHeading = normalizedHdg;
            this.currentCenterValue = normalizedCenter;
            this.targetCenterValue = normalizedCenter;
            this.updateVisuals();
            this.stopAnimation();
        } else {
            // Animated update
            this.targetHeading = normalizedHdg;
            this.targetCenterValue = normalizedCenter;
            this.startAnimation();
        }

        this.show();
    }

    public updateCenter(centerValue: number, instant: boolean = false): void {
        const normalizedCenter = this.normalize(centerValue);

        if (instant) {
            this.currentCenterValue = normalizedCenter;
            this.targetCenterValue = normalizedCenter;
            this.updateVisuals();
        } else {
            this.targetCenterValue = normalizedCenter;
            this.startAnimation();
        }
    }

    public setAnimationSpeed(speed: number): void {
        // Clamp speed between 0.01 and 1
        this.animationSpeed = Math.max(0.01, Math.min(1, speed));
    }

    public show(): void { 
        this.container.classList.remove('hidden');
        this.startAnimation();
    }

    public hide(): void { 
        this.container.classList.add('hidden');
        this.stopAnimation();
    }
}
