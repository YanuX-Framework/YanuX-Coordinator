import { LitElement, customElement, property, TemplateResult, html, css, PropertyValues } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import '@polymer/paper-dialog/paper-dialog.js';

import SharedResource from './SharedResource';
import createIcon from './assets/icons/create-black.svg';
import shareIcon from './assets/icons/share-black.svg';
import deleteIcon from './assets/icons/delete-black.svg';
import { PaperDialogElement } from '@polymer/paper-dialog/paper-dialog.js';

@customElement('yanux-resource-management')
class ResourceManagermentElement extends LitElement {
    @property({ type: String, reflect: true }) resourceId: string;
    @property({ type: Array, reflect: true }) resources: Array<SharedResource>

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
        const resourceManagementSelect = this.shadowRoot.getElementById('resource-management-select') as HTMLSelectElement;
        this.resourceId = resourceManagementSelect ? resourceManagementSelect.value : null;
    }

    createResource(e: Event) {
        const resourceName = (this.shadowRoot.getElementById('create-resource-name') as HTMLInputElement).value;
        console.log('[YXRME - Create Resource] Event:', e, 'Name:', resourceName);
    }

    shareResource(e: Event) {
        console.log('[YXRME - Share Resource] Event:', e);
    }

    deleteResource(e: Event) {
        console.log('[YXRME - Delete Resource] Event:', e);
    }

    showCreateResourceDialog(e: Event) {
        console.log('[YXRME - Show Create Resource Dialog] Event:', e);
        const createResourceDialog = this.shadowRoot.getElementById('create-resource-dialog') as PaperDialogElement;
        createResourceDialog.open();
    }

    showShareResourceDialog(e: Event) {
        console.log('[YXRME - Show Share Resource Dialog] Event:', e);
        const shareResourceDialog = this.shadowRoot.getElementById('share-resource-dialog') as PaperDialogElement;
        shareResourceDialog.open();
    }

    showDeleteResourceDialog(e: Event) {
        console.log('[YXRME - Show Delete Resource Dialog] Event:', e);
        const deleteResourceDialog = this.shadowRoot.getElementById('delete-resource-dialog') as PaperDialogElement;
        deleteResourceDialog.open();
    }

    static get styles() {
        return css`
        :host {
            --font-family: Arial, Helvetica, sans-serif;
            --resource-management-width: max-content;
            --resource-management-margin: auto;
            --resource-management-icon-size: 24px;
            --resource-management-select-padding: 4px;
            --resource-management-buttons-margin: 4px;
            --resource-management-buttons-text-align: center;
            --resource-management-button-margin: 8px;
            --resource-management-button-padding: 8px;
        }
        #container {
            font-family: var(--font-family);
        }
        #resource-management {
            width: var(--resource-management-width);
            margin: var(--resource-management-margin);
        }
        .resource-management-icon {
            width: var(--resource-management-icon-size);
            height: var(--resource-management-icon-size);
        }
        #resource-management-select {
            padding: var(--resource-management-select-padding);
        }
        #resource-management-buttons {
            margin: var(--resource-management-buttons-margin);
            text-align: var(--resource-management-buttons-text-align);
        }
        .resource-management-button {
            margin: var(--resource-management-button-margin);
            padding: var(--resource-management-button-padding);
        }
        .dialog > .inputs > input {
            padding: 8px;
        }
        .dialog > .buttons > button {
            margin: 4px;
            padding: 4px;
        }
        `;
    }

    render(): TemplateResult {
        if (this.resources) {
            return html`
            <paper-dialog id="create-resource-dialog" class="dialog">
                <h2>Create Resource</h2>
                <div class="inputs">
                    <label for="create-resource-name">Name:</label>
                    <input type="text" id="create-resource-name" name="create-resource-name">
                </div>
                <div class="buttons">
                    <button type="button" dialog-dismiss>
                        <slot name="create-resource-cancel">Cancel</slot>
                    </button>
                    <button type="button" @click="${this.createResource}" dialog-confirm autofocus>
                        <slot name="create-resource-ok">OK</slot>
                    </button>
                 </div>
            </paper-dialog>
            <paper-dialog id="share-resource-dialog">
                <h2>Share Resource</h2>
            </paper-dialog>
            <paper-dialog id="delete-resource-dialog">
                <h2>Delete Resource</h2>
            </paper-dialog>
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
                    <div id="resource-management-buttons" part="resourcer-management-buttons">
                        <button id="resource-management-button-create" part="resource-management-button-create"
                            class="resource-management-button" type="button"
                            @click="${this.showCreateResourceDialog}">
                            <slot name="resource-management-button-create-icon">
                                <div id="resource-management-create-icon" class="resource-management-icon">${unsafeSVG(createIcon)}</div>
                            </slot>
                        </button> 
                        <button id="resource-management-button-share" part="resource-management-button-share"
                            class="resource-management-button" type="button"
                            @click="${this.showShareResourceDialog}">
                            <slot name="resource-management-button-share-icon">
                                <div id="resource-management-share-icon" class="resource-management-icon">${unsafeSVG(shareIcon)}</div>
                            </slot>
                        </button>
                        <button id="resource-management-button-delete" part="resource-management-button-delete"
                            class="resource-management-button" type="button"
                            @click="${this.showDeleteResourceDialog}">
                            <slot name="resource-management-button-delete-icon">
                                <div id="resource-management-delete-icon" class="resource-management-icon">${unsafeSVG(deleteIcon)}</div>
                            </slot>
                        </button>
                    </div>
                </div>
            </div>
            `;
        } else { return null; }
    }
}

export default ResourceManagermentElement;