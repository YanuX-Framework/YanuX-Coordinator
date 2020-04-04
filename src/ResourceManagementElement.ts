import { LitElement, customElement, property, TemplateResult, html, css } from 'lit-element'
import SharedResource from './SharedResource';

@customElement('yanux-resource-management')
class ResourceManagermentElement extends LitElement {
    @property({ type: Array, reflect: true }) resources: Array<SharedResource>
    static get styles() {
        return css`
        :host {
            --resource-management-width: max-content;
            --resource-management-margin: auto;
        }
        #resource-management {
            width: var(--resource-management-width);
            margin: var(--resource-management-margin);
        }
        `;
    }
    render(): TemplateResult {
        if (this.resources) {
            return html`
            <div id="container"
               part="container">
               <div id="resource-management"
                    part="resource-management">
                    <select id="resource-management-select"
                            part="resource-management-select">
                    ${this.resources.map(r => html`
                        <option value="${r.id}">${r.name ? r.name + ': ' : html``}${r.owner}</option>
                    `)}
                    </select>
                </div>
            </div>
            `;
        } else { return html`` }
    }
}

export default ResourceManagermentElement;