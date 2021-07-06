import { LitElement, customElement, property, TemplateResult, html, css, PropertyValues } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

import '@polymer/paper-dialog/paper-dialog.js';
import { PaperDialogElement } from '@polymer/paper-dialog/paper-dialog.js';

import SharedResource from './SharedResource';
import createIcon from './assets/icons/create-black.svg';
import renameIcon from './assets/icons/rename-black.svg';
import shareIcon from './assets/icons/share-black.svg';
import deleteIcon from './assets/icons/delete-black.svg';

/**
 * A web component (a custom element) that can be fed with information about the resources that a {@link User} has access to.
 * It can be used to create, edit, delete, share or unshare resources.
 */
@customElement('yanux-resource-management')
export class ResourceManagermentElement extends LitElement {
    /**
     * The Id of the {@link User} that is running the client application.
     */
    @property({ type: String, reflect: true }) public userId: string;
    /**
     * The Id of the currently selected {@link Resource}.
     */
    @property({ type: String, reflect: true }) public selectedResourceId: string;
    /**
     * An object with the contents of the currently selected resource.
     */
    @property({ type: Object, reflect: true }) public selectedResource: SharedResource
    /**
     * An array of the resources that the user has access to.
     */
    @property({ type: Array, reflect: true }) public resources: Array<SharedResource>

    private checkIfOwnerAndResourceNameAreUnique(resource: SharedResource): boolean {
        return this.resources.some(r => resource.id !== r.id && resource.owner === r.owner && resource.name === r.name);
    }

    /**
     * A method that is called when a new resource is selected by the user.
     * @fires `CustomEvent` with the type `resource-selected` and a `detail` property that contains
     * the `selectedResourceId`, the `resourceId` (a copy of `selectedResourceId`) and `resource` (the value of the `selectedResource`) properties.
     * @param e - An HTMLSelectElement that triggered this function.
     */
    private resourceSelected(e: Event) {
        const resourceSelect = e.target as HTMLSelectElement;
        this.selectedResourceId = resourceSelect.value;
        this.selectedResource = this.resources[resourceSelect.selectedIndex];
        console.log('[YXRME - Selected] ResourceId:', this.selectedResourceId);
        let event = new CustomEvent('resource-selected', {
            detail: {
                selectedResourceId: this.selectedResourceId,
                resourceId: this.selectedResourceId,
                resource: this.selectedResource
            }
        });
        this.dispatchEvent(event);
    }

    /**
     * Invoked whenever the element is updated.
     * @param _changedProperties Map of changed properties with old values
     */
    protected updated(_changedProperties: PropertyValues) {
        const resourceSelectEl = this.shadowRoot.getElementById('resource-management-select') as HTMLSelectElement;
        this.selectedResource = resourceSelectEl && this.resources ? this.resources[resourceSelectEl.selectedIndex] : null;
        this.selectedResourceId = this.selectedResource ? this.selectedResource.id : this.selectedResourceId;
    }

    /**
     * @fires `CustomEvent` with the type `create-resource` and a `detail` property that contains
     * the property called `resourceName` with the name of the resource that was just created.
     * @param e - The Event that triggered this method.
     */
    private createResource(e: Event) {
        const createResourceDialog = this.shadowRoot.getElementById('create-resource-dialog') as PaperDialogElement;
        createResourceDialog.close();
        const resourceName = (this.shadowRoot.getElementById('create-resource-name') as HTMLInputElement).value;
        console.log('[YXRME - Create Resource] Event:', e, 'Name:', resourceName);
        let event = new CustomEvent('create-resource', { detail: { resourceName } });
        this.dispatchEvent(event);
    }

    /**
     * @fires `CustomEvent` with the type `rename-resource-name` and a `detail` property that contains
     * the `resourceId` (a copy of `selectedResourceId`), `resource` (the value of the `selectedResource`) and `resourceName` (the new name of the resource) properties.
     * @param e - The Event that triggered this method.
     */
    private renameResource(e: Event) {
        const renameResourceDialog = this.shadowRoot.getElementById('rename-resource-dialog') as PaperDialogElement;
        renameResourceDialog.close();
        const resourceName = (this.shadowRoot.getElementById('rename-resource-name') as HTMLInputElement).value;
        console.log('[YXRME - Rename Resource] Event:', e, 'Name:', resourceName);
        let event = new CustomEvent('rename-resource', {
            detail: {
                resourceId: this.selectedResourceId,
                resource: this.selectedResource,
                resourceName
            }
        });
        this.dispatchEvent(event);
    }

    /**
     * @fires `CustomEvent` with the type `delete-resource` and a `detail` property that contains
     * the `resourceId` (a copy of `selectedResourceId`) and `resource` (the value of the `selectedResource`) properties.
     * @param e - The Event that triggered this method.
     */
    private deleteResource(e: Event) {
        const deleteResourceDialog = this.shadowRoot.getElementById('delete-resource-dialog') as PaperDialogElement;
        deleteResourceDialog.close();
        console.log('[YXRME - Delete Resource] Event:', e);
        let event = new CustomEvent('delete-resource', {
            detail: {
                resourceId: this.selectedResourceId,
                resource: this.selectedResource
            }
        });
        this.dispatchEvent(event);
    }

    /**
     * @fires `CustomEvent` with the type `share-resource-email` and a `detail` property that contains
     * the `resourceId` (a copy of `selectedResourceId`), `resource` (the value of the `selectedResource`) 
     * and `userEmail` (the e-mail of the user with whom the resource was shared) properties.
     * @param e - The Event that triggered this method.
     */
    private shareResource(e: Event) {
        const shareResourceDialog = this.shadowRoot.getElementById('share-resource-dialog') as PaperDialogElement;
        shareResourceDialog.close();
        const userEmail = (this.shadowRoot.getElementById('share-resource-email') as HTMLInputElement).value;
        console.log('[YXRME - Share Resource] Event:', e, 'Name:', userEmail);
        let event = new CustomEvent('share-resource', {
            detail: {
                resourceId: this.selectedResourceId,
                resource: this.selectedResource,
                userEmail
            }
        });
        this.dispatchEvent(event);
    }

    /**
     * @fires `CustomEvent` with the type `unshare-resource-dialog` and a `detail` property that contains
     * the `resourceId` (a copy of `selectedResourceId`), `resource` (the value of the `selectedResource`) 
     * and `userEmail` (the e-mail of the user with whom the resource was unshared) properties.
     * @param e - The Event that triggered this method.
     */
    private unshareResource(e: Event) {
        const unshareResourceDialog = this.shadowRoot.getElementById('unshare-resource-dialog') as PaperDialogElement;
        unshareResourceDialog.close();
        console.log('[YXRME - Unshare Resource] Event:', e);

        const sharedWithSelectEl = this.shadowRoot.getElementById('resource-management-sharedwith-select') as HTMLSelectElement;
        const user = sharedWithSelectEl && this.selectedResource && this.selectedResource.sharedWith ? this.selectedResource.sharedWith[sharedWithSelectEl.selectedIndex] : null;

        let event = new CustomEvent('unshare-resource', {
            detail: {
                resourceId: this.selectedResourceId,
                resource: this.selectedResource,
                userEmail: user.email
            }
        });
        this.dispatchEvent(event);
    }

    /**
     * @todo Document private method.
     * @param e 
     */
    private showCreateResourceDialog(e: Event) {
        console.log('[YXRME - Show Create Resource Dialog] Event:', e);
        const createResourceDialog = this.shadowRoot.getElementById('create-resource-dialog') as PaperDialogElement;
        createResourceDialog.open();
    }

    /**
     * @todo Document private method.
     * @param e 
     */
    private showRenameResourceDialog(e: Event) {
        console.log('[YXRME - Show Rename Resource Dialog] Event:', e);
        const renameResourceDialog = this.shadowRoot.getElementById('rename-resource-dialog') as PaperDialogElement;
        renameResourceDialog.open();
    }

    /**
     * @todo Document private method.
     * @param e 
     */
    private showDeleteResourceDialog(e: Event) {
        console.log('[YXRME - Show Delete Resource Dialog] Event:', e);
        const deleteResourceDialog = this.shadowRoot.getElementById('delete-resource-dialog') as PaperDialogElement;
        deleteResourceDialog.open();
    }

    /**
     * @todo Document private method.
     * @param e 
     */
    private showShareResourceDialog(e: Event) {
        console.log('[YXRME - Show Share Resource Dialog] Event:', e);
        const shareResourceDialog = this.shadowRoot.getElementById('share-resource-dialog') as PaperDialogElement;
        shareResourceDialog.open();
    }

    /**
     * @todo Document private method.
     * @param e 
     */
    private showUnshareResourceDialog(e: Event) {
        console.log('[YXRME - Show Delete Resource Dialog] Event:', e);
        const unshareResourceDialog = this.shadowRoot.getElementById('unshare-resource-dialog') as PaperDialogElement;
        unshareResourceDialog.open();
    }

    /**
     * A method that returs the CSS styles of the custom elements.
     * @remarks It should not be used on its own. However, the look of the element can be customized using CSS custom properties.
     */
    public static get styles() {
        return css`
        :host {
            --host-font-family: Arial, Helvetica, sans-serif;
            --host-display: block;
            --host-width: max-content;

            --resource-management-text-align: center;
            --resource-management-select-padding: 4px;
            --resource-management-icon-size: 24px;
            --resource-management-sharedwith-title-font-weight: bold;
            --resource-management-sharedwith-title-font-size: 0.8em;

            --button-outline: 0;
            --button-vertical-align: middle;
            --button-border: 1px solid #ccc;
            --button-margin: 4px;
            --button-padding: 8px 12px;
            --button-border-radius: 8px;
            --button-active-box-shadow: inset 0px 0 32px #00000077;
            --small-button-padding: 4px 6px;

            --dialog-form-margin: auto auto 12px auto;
            --dialog-form-margin-fields: 24px auto auto auto;
            --dialog-form-buttons-display: flex;
            --dialog-form-buttons-jutify-content: end;
            --dialog-form-buttons-margin: 12px auto auto auto;
            --dialog-label-font-weight: bold;
            --dialog-input-padding: 8px;

            font-family: var(--host-font-family);
            display: var(--host-display);
            width: var(--host-width);
        }


        #resource-management,
        #resource-management-buttons {
            text-align: var(--resource-management-text-align);
        }

        #resource-management-select,
        #resource-management-sharedwith-select {
            padding: var(--resource-management-select-padding);
        }

        #resource-management-sharedwith-title{
            font-weight: var(--resource-management-sharedwith-title-font-weight);
            font-size: var(--resource-management-sharedwith-title-font-size);
        }

        .resource-management-icon {
            width: var(--resource-management-icon-size);
            height: var(--resource-management-icon-size);
        }

        .resource-management-sharedwith-icon {
            width: var(--resource-management-icon-size);
            height: var(--resource-management-icon-size);
        }

        .button:enabled:active {
            box-shadow: var(--button-active-box-shadow);
        }

        .button:focus {
            outline: var(--button-outline);
        }

        .button {
            border: var(--button-border);
            padding: var(--button-padding);
            border-radius: var(--button-border-radius);
            margin: var(--button-margin);
            vertical-align: var(--button-vertical-align);
        }

        .small-button {
            padding: var(--small-button-padding);
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

        .dialog-label {
            font-weight: var(--dialog-label-font-weight);
        }

        .dialog-input {
            padding: var(--dialog-input-padding);
        }
        `;
    }

    /**
     * Rendering the custom element.
     */
    protected render(): TemplateResult {
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
                        <option id="resource-management-option-${r.id}"
                            class="resource-management-option"
                            part="resource-management-option resource-management-option-${r.id}" 
                            value="${r.id}"
                            ?selected="${r.id === this.selectedResourceId}">
                            ${r.name ? `${r.name}: ` : null} ${r.owner}
                            ${this.checkIfOwnerAndResourceNameAreUnique(r) ? ` (${r.id})` : null}
                            ${r.default ? `- default` : null}
                        </option>
                    `)}
                    </select>

                    <div id="resource-management-buttons" part="resourcer-management-buttons">
                        <button id="resource-management-button-create" part="resource-management-button-create"
                            class="button resource-management-button" type="button"
                            @click="${this.showCreateResourceDialog}">
                            <slot name="resource-management-button-create-icon">
                                <div id="resource-management-create-icon" class="resource-management-icon">${unsafeSVG(createIcon)}</div>
                            </slot>
                        </button>

                        <button id="resource-management-button-share" part="resource-management-button-share"
                            class="button resource-management-button" type="button"
                            @click="${this.showRenameResourceDialog}">
                            <slot name="resource-management-button-share-icon">
                                <div id="resource-management-share-icon" class="resource-management-icon">${unsafeSVG(renameIcon)}</div>
                            </slot>
                        </button>

                        <button id="resource-management-button-share" part="resource-management-button-share"
                            class="button resource-management-button" type="button"
                            @click="${this.showShareResourceDialog}">
                            <slot name="resource-management-button-share-icon">
                                <div id="resource-management-share-icon" class="resource-management-icon">${unsafeSVG(shareIcon)}</div>
                            </slot>
                        </button>

                        <button id="resource-management-button-delete" part="resource-management-button-delete"
                            class="button resource-management-button" type="button"
                            @click="${this.showDeleteResourceDialog}">
                            <slot name="resource-management-button-delete-icon">
                                <div id="resource-management-delete-icon" class="resource-management-icon">${unsafeSVG(deleteIcon)}</div>
                            </slot>
                        </button>
                    </div>

                    <div id="resource-management-sharedwith"
                        part="resource-management-sharedwith">
                        ${this.selectedResource && this.selectedResource.sharedWith && this.selectedResource.sharedWith.length > 0 ? html`
                        <span id="resource-management-sharedwith-title"
                            part=resource-management-sharedwith-title">
                            <slot name="resource-management-sharedwith-title">
                                Shared with:
                            </slot>
                        </span>
                        <select id="resource-management-sharedwith-select"
                                part="resource-management-sharedwith-select">
                            ${this.selectedResource.sharedWith.map(u => html`
                                <option id="resource-management-sharedwith-option-${u.id}"
                                    class="resource-management-sharedwith-option"
                                    part="resource-management-sharedwith-option resource-management-sharedwith-option-${u.id}"
                                    value="${u.id}">
                                    ${u.email}
                                </option>
                            `)}
                        </select>
                        <span id="resource-management-sharedwith-buttons" part="resourcer-management-sharedwith-buttons">
                            <button id="resource-management-sharedwith-button-delete" part="resource-management-sharedwith-button-delete"
                                class="button small-button resource-management-sharedwith-button" type="button"
                                ?disabled=${this.userId && this.selectedResource && this.selectedResource.user && this.selectedResource.user.id !== this.userId}
                                @click="${this.showUnshareResourceDialog}>
                                <slot name="resource-management-sharedwith-button-delete-icon">
                                    <div id="resource-management-sharedwith-delete-icon" class="resource-management-sharedwith-icon">
                                        ${unsafeSVG(deleteIcon)}
                                    </div>
                                </slot>
                            </button>
                        </span>
                        ` : null}
                    </div>
                </div>
                <div id="dialogs">
                    <paper-dialog id="create-resource-dialog" class="dialog">
                        <form id="create-resource-dialog-form" class="dialog-form" @submit="${this.createResource}" action="javascript:void(0);">
                            <h2><slot name="create-resource-title">Create Resource</slot></h2>
                            <div class="fields">
                                <label class="dialog-label" for="create-resource-name">
                                    <slot name="create-resource-name-label">Name:</slot>
                                </label>
                                <input class="dialog-input" id="create-resource-name" name="create-resource-name" type="text" required>
                            </div>
                            <div class="buttons">
                                <button class="button dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="create-resource-cancel">Cancel</slot>
                                </button>
                                <button class="button dialog-button dialog-button-ok" type="submit" autofocus>
                                    <slot name="create-resource-ok">OK</slot>
                                </button>
                            </div>
                        </form>
                    </paper-dialog>

                    <paper-dialog id="rename-resource-dialog" class="dialog">
                        <form id="rename-resource-dialog-form" class="dialog-form" @submit="${this.renameResource}" action="javascript:void(0);">
                            <h2><slot name="rename-resource-title">Rename Resource</slot></h2>
                            <div class="fields">
                                <label class="dialog-label" for="rename-resource-name">
                                    <slot name="rename-resource-name-label">Name:</slot>
                                </label>
                                <input class="dialog-input" id="rename-resource-name" name="rename-resource-name" type="text" required
                                        .value="${this.selectedResource ? (this.selectedResource.name ? this.selectedResource.name : '') : ''}">
                            </div>
                            <div class="buttons">
                                <button class="button dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="rename-resource-cancel">Cancel</slot>
                                </button>
                                <button class="button dialog-button dialog-button-ok" type="submit" autofocus>
                                    <slot name="rename-resource-ok">OK</slot>
                                </button>
                            </div>
                        </form>
                    </paper-dialog>

                    <paper-dialog id="share-resource-dialog">
                        <form id="share-resource-dialog-form" class="dialog-form" @submit="${this.shareResource}" action="javascript:void(0);">
                            <h2><slot name="share-resource-title">Share Resource</slot></h2>
                            <div class="fields">
                                <label class="dialog-label" for="share-resource-email">
                                    <slot name="share-resource-email-label">Email:</slot>
                                </label>
                                <input class="dialog-input" id="share-resource-email" name="share-resource-email" type="email" required>
                            </div>
                            <div class="buttons">
                                <button class="button dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="share-resource-cancel">Cancel</slot>
                                </button>
                                <button class="button dialog-button dialog-button-ok" type="submit" autofocus>
                                    <slot name="share-resource-ok">OK</slot>
                                </button>
                            </div>
                        </form>
                    </paper-dialog>

                    <paper-dialog id="delete-resource-dialog">
                        <div class="dialog-form">
                            <h2><slot name="delete-resource-title">Delete Resource</slot></h2>
                            <div class="fields">
                                <slot name="delete-resource-message">Are you sure you want to delete the currently selected resource?</slot>
                            </div>
                            <div class="buttons">
                                <button class="button dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="delete-resource-cancel">Cancel</slot>
                                </button>
                                <button class="button dialog-button dialog-button-ok" type="button" @click="${this.deleteResource}" dialog-confirm autofocus>
                                    <slot name="delete-resource-ok">OK</slot>
                                </button>
                            </div>
                        </div>
                    </paper-dialog>

                    <paper-dialog id="unshare-resource-dialog">
                        <div class="dialog-form">
                            <h2><slot name="unshare-resource-title">Unshare Resource</slot></h2>
                            <div class="fields">
                                <slot name="unshare-resource-message">Are you sure you want to stop the currently selected user from accessing this resource?</slot>
                            </div>
                            <div class="buttons">
                                <button class="button dialog-button dialog-button-cancel" type="button" dialog-dismiss>
                                    <slot name="unshare-resource-cancel">Cancel</slot>
                                </button>
                                <button class="button dialog-button dialog-button-ok" type="button" @click="${this.unshareResource}" dialog-confirm autofocus>
                                    <slot name="unshare-resource-ok">OK</slot>
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