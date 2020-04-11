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
    
    //yanuxResourceManagementElement.setAttribute('resourceId', '5e84f4950f5de41614105259');
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
});