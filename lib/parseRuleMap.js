const fs = require('fs');
const flattenDeep = require('lodash/flattenDeep');
const Rules = require('atomizer/src/rules');

(function() {
    function replaceRTLTokens(str = '') {
        if (typeof str !== 'string') {
            return str;
        }
        return str.replace(/__START__/g, 'left').replace(/__END__/g, 'right');
    }

    let processedRules;
    try {
        processedRules = JSON.stringify(Rules);
        processedRules = replaceRTLTokens(processedRules);
        processedRules = JSON.parse(processedRules);
    } catch (e) {
        processedRules = Rules;
        console.error('[ACSS searcher] process rules failed');
    }

    /* const regex = new RegExp(`${searchText}`, 'i');
    const result = processedRules.filter(rule => {
        return rule.name.search(regex) > -1 || rule.matcher.search(regex) > -1;
    }); */
    const CUSTOM_PARAM = '<custom-param>';
    const VALUE = '<value> or ';
		const resultMap = {};
    processedRules.forEach(rule => {
        const { allowParamToValue, arguments: { '0': argument = {} } = [], matcher, styles, name } = rule;
        const styleNames = Object.keys(styles);
        const matcherValueString = allowParamToValue ? VALUE : '';
        let deprecatedWarning = '';
        if (name.indexOf('deprecated') === -1) {
					const acssClass = `${matcher}(${matcherValueString}${CUSTOM_PARAM})`;
					const styleClass = styleNames.map((styleName) => `${styleName}: value`);
					const mainClass = `${acssClass} ${styleClass}`;
					Object.keys(argument).forEach(key => {
						const keyClass = `${matcher}(${key})`;
						const valueClass = styleNames.map((styleName) => `${styleName}: ${argument[key]}`);
						resultMap[valueClass] = keyClass;
					})
					resultMap[styleClass] = acssClass;
				}
    });
    fs.writeFile('./ruleMap.js',
        `export default {${JSON.stringify(resultMap, 0, 4)}}`,
        (err) => err && console.log('err', err));
})();
