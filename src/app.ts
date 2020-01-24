import './ComponentsDistributionElement'
import { componentsDistribution } from './examples'

document.addEventListener("DOMContentLoaded", function (e) {
    const yanuxComponentsDistributionElement = document.getElementById('ycd');
    yanuxComponentsDistributionElement.setAttribute(
        'componentsdistribution',
        JSON.stringify(componentsDistribution)
    )
    yanuxComponentsDistributionElement.addEventListener(
        'updated-components-distribution',
        (e: CustomEvent) => console.log('[YXCDE] Updated Components Distribution:', e.detail)
    )
    yanuxComponentsDistributionElement.addEventListener(
        'reset-auto-components-distribution',
        (e: CustomEvent) => console.log('[YXCDE] Reset Auto Components Distribution:', e.detail)
    )
});