
(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('legend', legend);

    legend.$inject = ['common'];

    function legend(common) {
        return {
            bind: function (data, selection,chart, extraParams) {
                var me = chart;
                var measure = data;

                var width = 12,
                    height = 12;
                var labelStack = [];
                var legend = selection.append('g')
                    .attr('id', function () {
                        return me._getName() + '-legend';
                    })
                    .attr('class', 'legend')
                    .attr('display', 'block');

                var legendItem = legend.selectAll('.item')
                    .data(data.measureConfig)
                    .enter().append('g')
                    .attr('class', 'item')
                    .attr('id', function (d, i) {
                        return me._getName() + '-legend-item' + i;
                    })
                    .attr('transform', function (d, i) {
                        var translate = [0, 0];

                        switch (me.legendPosition()) {
                            case 'Top':
                                translate = [i * Math.floor(extraParams.width / data.measureConfig.length), 0];
                                break;
                            case 'Bottom':
                                translate = [i * Math.floor(extraParams.width / data.measureConfig.length), (extraParams.height - common.PADDING)];
                                break;
                            case 'Right':
                                translate = [(4 / 5) * extraParams.width, i * 20];
                                break;
                            case 'Left':
                                translate = [0, i * 20];
                        }
                        return 'translate(' + translate.toString() + ')';
                    })
                    .on('mouseover', function (d, i) {
                        var k = d3.select(this.parentNode),
                            plot = d3.select(k.node().parentNode).select('.plot')
                        d3.select(this).attr('cursor', 'pointer');
                        me._legendInteraction('mouseover', data.measureName[i], plot);
                    })
                    .on('mousemove', function (d, i) {
                        var k = d3.select(this.parentNode),
                            plot = d3.select(k.node().parentNode).select('.plot')
                        d3.select(this).attr('cursor', 'pointer');
                        me._legendInteraction('mousemove', data.measureName[i], plot);
                    })
                    .on('mouseout', function (d, i) {
                        var k = d3.select(this.parentNode),
                            plot = d3.select(k.node().parentNode).select('.plot')
                        d3.select(this).attr('cursor', 'default');
                        me._legendInteraction('mouseout', data.measureName[i], plot);
                    })
                    .on('click', function (d, i) {
                        var k = d3.select(this.parentNode)
                        d3.select(k.node().parentNode).select('.plot').remove();

                        var rect = d3.select(this).select('rect'),
                            o = parseInt(rect.style('fill-opacity'));

                        if (!o) {
                            d3.select(this).select('rect')
                                .style('fill-opacity', 1)
                                .style('stroke-width', 0);

                        } else {
                            d3.select(this).select('rect')
                                .style('fill-opacity', .5)
                                .style('stroke-width', 2);
                        }

                        me._legendInteraction('click', data.measureName[i]);
                    });

                legendItem.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', function (d, i) {
                        if (d == '' || d == null || d == undefined) {
                            return common.COLORSCALE(i);
                        }
                        return d;
                    })
                    .style('stroke', function (d, i) {
                        if (d == '' || d == null || d == undefined) {
                            return common.COLORSCALE(i);
                        }
                        return d;
                    })
                    .style('stroke-width', 0);

                legendItem.append('text')
                    .attr('x', 18)
                    .attr('y', 10)
                    .text(function (d, i) {
                        return measure.measureName[i];
                    })
                    .style('font-weight', 'bold')


                var legendBreak = 0,
                    legendBreakCount = 0;
                if (me.legendPosition() == 'Top') {
                    legendItem.attr('transform', function (d, i) {
                        var count = i,
                            widthSum = 0
                        while (count-- != 0) {
                            widthSum += d3.select('#' + me._getName() + '-legend-item' + count).node().getBBox().width + 16;
                        }
                        if ((widthSum + 100) > extraParams.width) {
                            widthSum = 0;
                            if (legendBreak == 0) {
                                legendBreak = i;
                                legendBreakCount = legendBreakCount + 1;
                            }
                            if (i == (legendBreak * (legendBreakCount + 1))) {
                                legendBreakCount = legendBreakCount + 1;
                            }
                            var newcount = i - (legendBreak * legendBreakCount);
                            while (newcount-- != 0) {
                                widthSum += d3.select('#' + me._getName() + '-legend-item' + newcount).node().getBBox().width + 16;
                            }
                            return 'translate(' + widthSum + ', ' + legendBreakCount * 20 + ')';
                        }
                        return 'translate(' + widthSum + ', ' + (me.legendPosition() == 'Top' ? 0 : extraParams.height) + ')';
                    });
                    extraParams.height = extraParams.height - (20 * legendBreakCount);
                }

                return {
                    legendWidth: legend.node().getBBox().width,
                    legendHeight: legend.node().getBBox().height,
                    legendBreakCount: legendBreakCount
                }
            }
        }
    }
})();
