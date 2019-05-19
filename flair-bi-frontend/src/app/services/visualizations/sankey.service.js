import angular from 'angular';

'use strict';
angular
    .module('flairbiApp')
    .factory('GenerateSankey', GenerateSankey);

GenerateSankey.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateSankey(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measure = features.measures,
                    colorSet = D3Utils.getDefaultColorset();

                result['dimension'] = D3Utils.getNames(dimensions);
                result['measure'] = D3Utils.getNames(measure);

                result['maxDim'] = dimensions.length;
                result['maxMes'] = measure.length;

                result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Color Pattern').toLowerCase().replace(' ', '_');

                var displayColor = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display colour');
                result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                var borderColor = VisualizationUtils.getFieldPropertyValue(measure[0], 'Border colour');
                result['borderColor'] = (borderColor == null) ? colorSet[1] : borderColor
                result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                result['showLabels'] = [];
                result['fontStyle'] = [];
                result['fontWeight'] = [];
                result['fontSize'] = [];
                result['textColor'] = [];
                for (var i = 0; i < result.maxDim; i++) {
                    result['showLabels'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                    result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                    result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                    result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                    result['textColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                }
                return result;
            }

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var sankey = $rootScope.updateWidget[record.id];
                    sankey.update(record.data);
                }
            } else {
                d3.select(element[0]).html('')
                var div = d3.select(element[0]).append('div')
                    .attr('id', 'sankey-' + element[0].id)
                    .style('width', element[0].clientWidth + 'px')
                    .style('height', element[0].clientHeight + 'px')
                    .style('overflow', 'hidden')
                    .style('text-align', 'center')
                    .style('position', 'relative');

                var svg = div.append('svg')
                    .attr('width', element[0].clientWidth)
                    .attr('height', element[0].clientHeight)

                var tooltip = div.append('div')
                    .attr('class', 'custom_tooltip')

                var sankey = flairVisualizations.sankey()
                    .config(getProperties(VisualizationUtils, record))
                    .tooltip(true)
                    .broadcast($rootScope)
                    .filterParameters(filterParametersService)
                    .print(false);

                svg.datum(record.data)
                    .call(sankey);

                $rootScope.updateWidget[record.id] = sankey;
            }
        }
    }
}