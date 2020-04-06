import './ComponentsDistributionElement';
import './ResourceManagementElement';
import { componentsDistribution, resources } from './examples';

document.addEventListener("DOMContentLoaded", function (e) {
    const yanuxComponentsDistributionElement = document.getElementById('ycd');
    const yanuxResourceManagementElement = document.getElementById('yrm');

    yanuxComponentsDistributionElement.setAttribute(
        'componentsdistribution',
        JSON.stringify(componentsDistribution)
    );
    yanuxComponentsDistributionElement.addEventListener(
        'updated-components-distribution',
        (e: CustomEvent) => console.log('[YXCDE] Updated Components Distribution:', e.detail)
    );
    yanuxComponentsDistributionElement.addEventListener(
        'reset-auto-components-distribution',
        (e: CustomEvent) => console.log('[YXCDE] Reset Auto Components Distribution:', e.detail)
    );

    yanuxResourceManagementElement.setAttribute('resources', JSON.stringify(resources));
    yanuxResourceManagementElement.addEventListener(
        'resource-selected',
        (e: CustomEvent) => console.log('[YXCDE] Reset Auto Components Distribution:', e.detail)
    );

    //setInterval(() => console.log('Hearbeat...'), 1000);
});