import { LitElement, html, TemplateResult } from 'lit-element';

class ComponentsDistributionElement extends LitElement {
  render(): TemplateResult {
    return html`
      <p>Application Instances</p>
    `;
  }
}
customElements.define('components-distribution', ComponentsDistributionElement);

export default ComponentsDistributionElement;