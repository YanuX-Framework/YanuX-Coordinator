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
    
    yanuxResourceManagementElement.setAttribute('userId', '5e879dc892bb3a6fd92d3c01');
    yanuxResourceManagementElement.setAttribute('resources', JSON.stringify(resources));
    
    yanuxResourceManagementElement.addEventListener(
        'resource-selected',
        (e: CustomEvent) => console.log('[YXRME]: Resource Selected', e.detail)
    );
    yanuxResourceManagementElement.addEventListener(
        'create-resource',
        (e: CustomEvent) => console.log('[YXRME]: Create Resource', e.detail)
    );
    yanuxResourceManagementElement.addEventListener(
        'share-resource',
        (e: CustomEvent) => console.log('[YXRME]: Share Resource', e.detail)
    );
    yanuxResourceManagementElement.addEventListener(
        'delete-resource',
        (e: CustomEvent) => console.log('[YXRME]: Delete Resource', e.detail)
    );
    yanuxResourceManagementElement.addEventListener(
        'unshare-resource',
        (e: CustomEvent) => console.log('[YXRME]: Unshare Resource', e.detail)
    );
});