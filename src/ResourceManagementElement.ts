import { LitElement, customElement, property, TemplateResult, html, css, PropertyValues } from 'lit-element';
import SharedResource from './SharedResource';

@customElement('yanux-resource-management')
class ResourceManagermentElement extends LitElement {
    @property({ type: String, reflect: true }) resourceId: string;
    @property({ type: Array, reflect: true }) resources: Array<SharedResource>
    static get styles() {
        return css`
        :host {
            --font-family: Arial, Helvetica, sans-serif;
            --resource-management-width: max-content;
            --resource-management-margin: auto;
        }
        #container {
            font-family: var(--font-family);
        }
        #resource-management {
            width: var(--resource-management-width);
            margin: var(--resource-management-margin);
        }
        `;
    }
    checkIfOwnerAndResourceNameAreUnique(resource: SharedResource): boolean {
        return this.resources.some(r => resource.id !== r.id && resource.owner === r.owner && resource.name === r.name);
    }
    resourceSelected(e: Event) {
        const resourceSelect = e.target as HTMLSelectElement;
        const selectedResourceId = resourceSelect.value;
        this.resourceId = selectedResourceId;
        console.log('[YXRME - Selected] ResourceId:', selectedResourceId);
        let event = new CustomEvent('resource-selected', {
            detail: {
                selectedResourceId,
                resource: this.resources[resourceSelect.selectedIndex]
            }
        });
        this.dispatchEvent(event);
    }
    updated(_changedProperties: PropertyValues) {
        this.resourceId = (this.shadowRoot.getElementById('resource-management-select') as HTMLSelectElement).value;
    }
    render(): TemplateResult {
        if (this.resources) {
            return html`
            <div id="container"
               part="container">
               <div id="resource-management"
                    part="resource-management">
                    <select id="resource-management-select"
                            part="resource-management-select"
                            @change=${this.resourceSelected}>
                    ${this.resources.map(r => html`
                        <option
                            id="resource-management-option-${r.id}"
                            class="resource-management-option"
                            part="resource-management-option resource-management-option-${r.id}" 
                            value="${r.id}">
                            ${r.name ? `${r.name}: ` : null} ${r.owner}
                            ${this.checkIfOwnerAndResourceNameAreUnique(r) ? ` (${r.id})` : null}
                        </option>
                    `)}
                    </select>
                </div>
            </div>
            `;
        } else { return null; }
    }
}

export default ResourceManagermentElement;