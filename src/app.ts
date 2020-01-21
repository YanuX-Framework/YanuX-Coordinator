import './ComponentsDistributionElement'
import { componentsDistribution } from './examples'

document.addEventListener("DOMContentLoaded", function (e) {
    document.getElementById('ycd').setAttribute('componentsdistribution', JSON.stringify(componentsDistribution))
});