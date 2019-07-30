(function () {
    "use strict";

    angular.module("flairbiApp").factory("GenerateBoxplot", GenerateBoxplot);

    GenerateBoxplot.$inject = [
        "VisualizationUtils",
        "$rootScope",
        "D3Utils",
        "filterParametersService"
    ];

    function GenerateBoxplot(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};


                    var features = VisualizationUtils.getDimensionsAndMeasures(
                        record.fields
                    ),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [];

                    result["dimension"] = ['country']//D3Utils.getNames(dimensions)[0];
                    result["measure"] = ['low', '1Q', 'median', '3Q', 'high']//D3Utils.getNames(measures);

                    result["maxMes"] = measures.length;

                    result["showXaxis"] = VisualizationUtils.getPropertyValue(record.properties, "Show X Axis");
                    result["showYaxis"] = VisualizationUtils.getPropertyValue(record.properties, "Show Y Axis");
                    result["axisColor"] = VisualizationUtils.getPropertyValue(record.properties, "Axis Colour");

                    result["showLabels"] = VisualizationUtils.getFieldPropertyValue(dimensions[0], "Show Labels");
                    result["labelColor"] = VisualizationUtils.getFieldPropertyValue(dimensions[0], "Colour of labels");
                    result["numberFormat"] = VisualizationUtils.getFieldPropertyValue(dimensions[0], "Number format");

                    result["displayColor"] = [];
                    for (var i = 0; i < result.maxMes; i++) {
                        result["displayColor"].push(VisualizationUtils.getFieldPropertyValue(measures[i], "Display colour"));
                    }
                    return result;
                }
                record.data = [{
                    "country": "Nepal",
                    "low": 10,
                    "1Q": 15,
                    "median": 20,
                    "3Q": 30,
                    "high": 45
                }, {
                    "country": "Denmark",
                    "low": 5,
                    "1Q": 10,
                    "median": 15,
                    "3Q": 20,
                    "high": 30
                }, {
                    "country": "India",
                    "low": 22,
                    "1Q": 25,
                    "median": 30,
                    "3Q": 45,
                    "high": 67
                }, {
                    "country": "UK",
                    "low": 20,
                    "1Q": 34,
                    "median": 55,
                    "3Q": 72,
                    "high": 90
                }, {
                    "country": "Canada",
                    "low": 2,
                    "1Q": 5,
                    "median": 8,
                    "3Q": 13,
                    "high": 20
                }, {
                    "country": "Australia",
                    "low": 25,
                    "1Q": 30,
                    "median": 35,
                    "3Q": 52,
                    "high": 70
                }, {
                    "country": "USA",
                    "low": -15,
                    "1Q": -5,
                    "median": 0,
                    "3Q": 10,
                    "high": 20
                }];
                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var boxplot = $rootScope.updateWidget[record.id];
                        boxplot.config(getProperties(VisualizationUtils, record))
                            .update(record.data);
                    }
                } else {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;position:relative" id="boxplot-' + element[0].id + '" ></div>')
                    var div = $('#boxplot-' + element[0].id)

                    var boxplot = flairVisualizations.boxplot()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        // .broadcast($rootScope)
                        // .filterParameters(filterParametersService)
                         .print(isNotification == true ? true : false)

                        .data(record.data);

                    boxplot(div[0])

                    $rootScope.updateWidget[record.id] = boxplot;

                }
            }
        }
    }
})();
