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
        const createResourceDialog = this.shadowRoot.getElementById('create-resource-dialog') as PaperDialogElement;
        createResourceDialog.close();
        const resourceName = (this.shadowRoot.getElementById('create-resource-name') as HTMLInputElement).value;
        console.log('[YXRME - Create Resource] Event:', e, 'Name:', resourceName);
        let event = new CustomEvent('create-resource', { detail: { resourceName } });
        this.dispatchEvent(event);
    }

    shareResource(e: Event) {
        const shareResourceDialog = this.shadowRoot.getElementById('share-resource-dialog') as PaperDialogElement;
        shareResourceDialog.close();
        const userEmail = (this.shadowRoot.getElementById('share-resource-email') as HTMLInputElement).value;
        console.log('[YXRME - Share Resource] Event:', e, 'Name:', userEmail);
        let event = new CustomEvent('share-resource', { detail: { userEmail } });
        this.dispatchEvent(event);
    }

    deleteResource(e: Event) {
        const deleteResourceDialog = this.shadowRoot.getElementById('delete-resource-dialog') as PaperDialogElement;
        deleteResourceDialog.close();
        console.log('[YXRME - Delete Resource] Event:', e);
        let event = new CustomEvent('delete-resource', { detail: { resourceId: this.resourceId } });
        this.dispatchEvent(event);
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
            --resource-management-buttons-text-align: center;
            --dialog-form-margin: auto auto 12px auto;
            --dialog-form-margin-fields: 24px auto auto auto;
            --dialog-form-buttons-display: flex;
            --dialog-form-buttons-jutify-content: end;
            --dialog-form-buttons-margin: 12px auto auto auto;
            --button-outline: 0;
            --button-border: 1px solid #ccc;
            --button-margin: 4px;
            --button-padding: 8px 12px;
            --button-border-radius: 8px;
            --button-active-box-shadow: inset 0px 0 32px #00000077;
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
            appearance: none;
        }

        #resource-management-buttons {
            text-align: var(--resource-management-buttons-text-align);
        }

        .dialog-form {
            margin: var(--dialog-form-margin);
        }

        .dialog-form .fields {
            margin: var(--dialog-form-margin-fields);
        }

        .dialog-form .buttons {
            display: var(--dialog-form-buttons-display);;
            justify-content: var(--dialog-form-buttons-jutify-content);
            margin: var(--dialog-form-buttons-margin);
        }

        button:focus {
            outline: var(--button-outline);
        }

        .resource-management-button,
        .dialog-button {
            border: var(--button-border);
            padding: var(--button-padding);
            border-radius: var(--button-border-radius);
            margin: var(--button-margin);
        }

        .dialog-button:active,
        .resource-management-button:active {
            box-shadow: var(--button-active-box-shadow);
        }

        .dialog-label {
            font-weight: bold;
        }

        .dialog-input {
            padding: 8px;
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
                            part="resource-management-select"
                            @change=${this.resourceSelected}>
                    ${this.resources.map(r => html`
                        <option
                            id="resource-management-option-${r.id}"
                            class="resource-management-option"
                            part="resource-management-option resource-management-option-${r.id}" 
                            value="${r.id}"
                            ?selected="${r.id === this.resourceId}">
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
                <div id="dialogs">
                    <paper-dialog id="create-resource-dialog" class="dialog">
                        <form id="create-resource-dialog-form" class="dialog-form" @submit="${this.createResource}" action="javascript:void(0);">
                            <h2>Create Resource</h2>
                            <div class="fields">
                                <label class="dialog-label" for="create-resource-name">
                                    <slot name="create-resource-name-label">Name:</slot>
                                </label>
                                <input class="dialog-input" id="create-resource-name" name="create-resource-name" type="text" required>
                            </div>
                            <div class="buttons">
                                <button class="dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="create-resource-cancel">Cancel</slot>
                                </button>
                                <button class="dialog-button dialog-button-ok" type="submit" autofocus>
                                    <slot name="create-resource-ok">OK</slot>
                                </button>
                            </div>
                        </form>
                    </paper-dialog>
                    <paper-dialog id="share-resource-dialog">
                        <form id="share-resource-dialog-form" class="dialog-form" @submit="${this.shareResource}" action="javascript:void(0);">
                            <h2>Share Resource</h2>
                            <div class="fields">
                                <label class="dialog-label" for="share-resource-email">
                                    <slot name="share-resource-email-label">Email:</slot>
                                </label>
                                <input class="dialog-input" id="share-resource-email" name="share-resource-email" type="email" required>
                            </div>
                            <div class="buttons">
                                <button class="dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="create-resource-cancel">Cancel</slot>
                                </button>
                                <button class="dialog-button dialog-button-ok" type="submit" autofocus>
                                    <slot name="create-resource-ok">OK</slot>
                                </button>
                            </div>
                        </form>
                    </paper-dialog>
                    <paper-dialog id="delete-resource-dialog">
                        <div class="dialog-form">
                            <h2>Delete Resource</h2>
                            <div class="fields">
                                <slot name="delete-resource-message">Are you sure you want to delete the currently selected resource?</slot>
                            </div>
                            <div class="buttons">
                                <button class="dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="create-resource-cancel">Cancel</slot>
                                </button>
                                <button class="dialog-button dialog-button-ok" type="button" @click="${this.deleteResource}" dialog-confirm autofocus>
                                    <slot name="create-resource-ok">OK</slot>
                                </button>
                            </div>
                        </div>
                    </paper-dialog>
                </div>
            </div>
            `;
        } else { return null; }
    }
}

export default ResourceManagermentElement;