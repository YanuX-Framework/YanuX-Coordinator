import _ from 'lodash';
import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';

@customElement('yanux-components-distribution')
class ComponentsDistributionElement extends LitElement {
  @property({ type: Object }) componentsDistribution: any = {}
  render(): TemplateResult {
    const instanceIds = Object.keys(this.componentsDistribution)
    const components = _.uniq(_.flatten(instanceIds.map(instanceId => Object.keys(this.componentsDistribution[instanceId].components))))
    return html`
    <table>
        <thead>
            <tr>
                <th>Device</th>
                ${components.map(component => html`
                <th>${component}</th>
                `)}
            </tr>
        </thead>
        <tbody>
            ${instanceIds.map(instanceId => html`
            <tr>
                <td>
                    ${this.componentsDistribution[instanceId].device.name}
                    ${Object.entries(this.componentsDistribution).some(([currInstanceId, instanceDetails]: [string, any]) =>
                      instanceId !== currInstanceId && (
                        instanceDetails.device.uuid === this.componentsDistribution[instanceId].device.uuid
                        || instanceDetails.device.name === this.componentsDistribution[instanceId].device.name
                      )) ? html`<span class="instanceId">${instanceId}</span>` : null}
                </td>
                ${components.map(component => html`
                <td>
                    <input type="checkbox"
                            name="instance-${instanceId}-component-${component}"
                            ?checked="${this.componentsDistribution[instanceId].components[component]}" />
                <td>
                `)}
            </tr>
            `)}
        </tbody>
    </table>
  `}
}
export default ComponentsDistributionElement;

