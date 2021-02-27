import { pull, uniq, flatten } from 'lodash';

import { LitElement, customElement, property, TemplateResult, html, css } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

import InstanceComponentsDistribution from './InstancesComponentsDistribution';
import powerBlackIcon from './assets/icons/power-black.svg';
import powerWhiteIcon from './assets/icons/power-white.svg';

@customElement('yanux-components-distribution')
export class ComponentsDistributionElement extends LitElement {
  //NOTE: https://julienrenaux.fr/2019/04/01/lit-element-rendering-strategies-explained/
  // async performUpdate() {
  //   await new Promise((resolve) => setTimeout(resolve));
  //   super.performUpdate();
  // }

  @property({ type: String, reflect: false }) instanceId: string;
  @property({ type: Object, reflect: false }) componentsDistribution: InstanceComponentsDistribution;

  checkIfDeviceInstanceHasMultipleInstancesRunning(instanceId: string = this.instanceId): boolean {
    return Object.entries(this.componentsDistribution)
      .some(([currInstanceId, instanceDetails]: [string, any]) =>
        instanceId !== currInstanceId &&
        this.componentsDistribution[instanceId] && instanceDetails.device &&
        (instanceDetails.device.uuid === this.componentsDistribution[instanceId].device.uuid ||
          instanceDetails.device.name === this.componentsDistribution[instanceId].device.name)
      );
  }

  handleCheckboxClick(instanceId: string, component: string) {
    return (e: InputEvent): void => {
      const checkboxChecked = (e.target as HTMLInputElement).checked
      console.log(
        '[YXCDE - Checkbox Clicked] Instance:', instanceId,
        'Component:', component,
        'Checked:', checkboxChecked
      );
      if (this.componentsDistribution[instanceId] && this.componentsDistribution[instanceId].components) {
        this.componentsDistribution[instanceId].components[component] = checkboxChecked;
        this.componentsDistribution[instanceId].auto = false;
      }
      this.componentsDistribution = Object.assign({}, this.componentsDistribution, {})
      let event = new CustomEvent('updated-components-distribution', {
        detail: {
          instanceId,
          component,
          checkboxChecked,
          componentsDistribution: this.componentsDistribution
        }
      });
      this.dispatchEvent(event);
    }
  }

  handleAutoButtonClick(instanceId: string) {
    return (e: InputEvent): void => {
      console.log('[YXCDE - Auto Button Clicked] Instance:', instanceId, 'Event:', e);
      if (this.componentsDistribution[instanceId]) {
        this.componentsDistribution[instanceId].auto = true;
      }
      this.componentsDistribution = Object.assign({}, this.componentsDistribution, {});
      let event = new CustomEvent('reset-auto-components-distribution', { detail: { instanceId } });
      this.dispatchEvent(event);
    }
  }

  static get styles() {
    return css`
    :host {
      --host-font-family: Arial, Helvetica, sans-serif;
      --host-display: block;
      --host-width: max-content;
      --table-border: 1px solid black;
      --table-border-collapse: collapse;
      --table-cell-padding: 4px;
      --table-cell-vertical-align: middle;
      --instance-info-text-align: center;
      --instance-info-text-align: center;
      --instance-info-labels-font-weight: bold;
      --instance-name-font-size: 0.8em;
      --instance-name-color: #777777;
      --component-cell-text-align: center;
      --button-outline: 0;
      --button-border: 1px solid #ccc;
      --button-padding: 8px 12px;
      --button-border-radius: 4px;
      --button-active-box-shadow: inset 0px 0 32px #00000077;
      --button-instance-auto-button-on-color: #ffffff;
      --button-instance-auto-button-on-background: #22AA22;
      --button-instance-auto-button-on-box-shadow: inset 0px 0 12px #00000077;
      --button-instance-auto-button-off-color: #ffffff;
      --button-instance-auto-button-off-background: #CC0000;
      --button-instance-auto-button-off-box-shadow: inset 0px 0 12px #ffffff77;
      --instance-auto-button-icon-size: 24px;

      font-family: var(--host-font-family);
      display: var(--host-display);
      width: var(--host-width);
    }

    #hidden-slots {
      display: none;
    }

    table {
      border-collapse: var(--table-border-collapse);
    } 

    table, th, td {
      border: var(--table-border);
    }

    th, td {
      padding: var(--table-cell-padding);
      vertical-align: var(--table-cell-vertical-align);
    }

    .instance-name {
      display: block;
      font-size: var(--instance-name-font-size);
      color: var(--instance-name-color);
    }

    .instance-name::before {
      content: "(";
    }

    .instance-name::after {
      content: ")";
    }

    .component-cell {
      text-align: var(--component-cell-text-align);
    }

    #instance-info {
      text-align: var(--instance-info-text-align);
    }

    #instance-info-device-name-label,
    #instance-info-name-label {
      font-weight: var(--instance-info-labels-font-weight);
    }

    button {
      border: var(--button-border);
      padding: var(--button-padding);
      border-radius: var(--button-border-radius);
    }

    button:focus {
      outline: var(--button-outline);
    }

    button:active,
    button.instance-auto-button-on:active,
    button.instance-auto-button-off:active  {
      box-shadow: var(--button-active-box-shadow);
    }

    button.instance-auto-button-on {
      color: var(--button-instance-auto-button-on-color);
      background: var(--button-instance-auto-button-on-background);
      box-shadow: var(--button-instance-auto-button-on-box-shadow);
    }

    button.instance-auto-button-off {
      color: var(--button-instance-auto-button-on-color);
      background: var(--button-instance-auto-button-off-background);
      box-shadow: var(--button-instance-auto-button-off-box-shadow);
    }

    .instance-auto-button-icon {
      width: var(--instance-auto-button-icon-size);
      height: var(--instance-auto-button-icon-size);
    }
    `;
  }

  render(): TemplateResult {
    if (this.instanceId && this.componentsDistribution) {
      const instanceInfo = this.componentsDistribution[this.instanceId];
      const instanceIds = Object.keys(this.componentsDistribution);
      const components =
        pull(uniq(flatten(
          instanceIds.map(
            instanceId => this.componentsDistribution[instanceId].components ? Object.keys(this.componentsDistribution[instanceId].components) : null
          ))), null);
      return html`
        <table id="components-distributions-table"
                part="components-distributions-table">
            <caption id="components-distributions-table-caption"
                      part="components-distributions-table-caption">
              <div id="instance-info"
                    part="instance-info">
                <div id="instance-device-name"
                      part="instance-device-name">
                    <span id="instance-info-device-name-label"
                          part="instance-info-device-name-label">
                          <slot name="instance-info-device-name-label-title">Device:</slot>
                    </span>
                    <span id="instance-info-device-name-value"
                          part="instance-info-device-name-value">
                        ${instanceInfo ? instanceInfo.device.name : null}
                    </span>
                </div>
                ${this.checkIfDeviceInstanceHasMultipleInstancesRunning() ? html`
                <div id="instance-info-name"
                      part="instance-info-name">
                    <span id="instance-info-name-label"
                          part="instance-info-name-label">
                          <slot name="instance-info-name-label-title">Instance:</slot>
                    </span>
                    <span id="instance-info-name-value"
                          part="instance-info-name-value">
                        ${instanceInfo.name ? instanceInfo.name : this.instanceId}
                    </span>
                </div>` : null}
              </div>
            </caption>
            <thead id="components-distributions-table-header"
                  part="components-distributions-table-header">
                <tr class="components-distributions-table-header-row"
                    part="components-distributions-table-header-row">
                    <th class="components-distributions-table-header-device-cell"
                        part="components-distributions-table-header-device-cell">
                        <slot name="components-distributions-table-header-device-cell-title">Device</slot>
                    </th>
                    ${components.map(component => html`
                    <th class="components-distributions-table-header-component-cell"
                        part="components-distributions-table-header-component-cell">
                        ${component}
                    </th>
                    `)}
                    <th class="components-distributions-table-header-auto-cell"
                        part="components-distributions-table-header-auto-cell">
                        <slot name="components-distributions-table-header-auto-cell-title">Auto</slot>
                    </th>
                </tr>
            </thead>
            <tbody id="components-distributions-table-body"
                    part="components-distributions-table-body">
                ${instanceIds.map(instanceId => html`
                <tr class="instance-row"
                    part="instance-row">
                    <td class="instance-cell"
                        part="instance-cell">
                        ${this.componentsDistribution[instanceId].device.name}
                        ${this.checkIfDeviceInstanceHasMultipleInstancesRunning(instanceId) ? html`
                        <span class="instance-name"
                              part="instance-name"><!--
                        -->${this.componentsDistribution[instanceId].name ? this.componentsDistribution[instanceId].name : instanceId}<!--
                        --></span>` : null}
                    </td>
                    ${components.map(component => html`
                    <td class="component-cell"
                        part="component-cell">
                        <label class="component-label"
                                part="component-label">
                            <input class="component-checkbox"
                                    part="component-checkbox"
                                    type="checkbox"
                                    name="instance-${instanceId}-component-${component}"
                                    .checked="${this.componentsDistribution[instanceId].components ? this.componentsDistribution[instanceId].components[component] : false}"
                                    @click="${this.handleCheckboxClick(instanceId, component)}" />
                        </label>
                    </td>
                    `)}
                    <td class="instance-auto"
                        part="instance-auto">
                        <button class="instance-auto-button ${this.componentsDistribution[instanceId].auto ? 'instance-auto-button-on' : 'instance-auto-button-off'}"
                                part="instance-auto-button ${this.componentsDistribution[instanceId].auto ? 'instance-auto-button-on' : 'instance-auto-button-off'}" 
                                type="button"
                                @click="${this.handleAutoButtonClick(instanceId)}">
                                <div class="instance-auto-button-icon">
                                ${this.componentsDistribution[instanceId].auto ? unsafeSVG(powerWhiteIcon) : unsafeSVG(powerBlackIcon)}
                                </div>
                        </button> 
                    </td>
                </tr>
                `)}
            </tbody>
        </table>
    `;
    } else { return null; }
  }
}

export default ComponentsDistributionElement;