import { LitElement, html, TemplateResult } from 'lit-element';

class ComponentsDistributionElement extends LitElement {
    render() : TemplateResult {
        return html`
      <!-- template content -->
      <p>A paragraph</p>
    `;
    }
}
customElements.define('components-distribution', ComponentsDistributionElement);

export default ComponentsDistributionElement;