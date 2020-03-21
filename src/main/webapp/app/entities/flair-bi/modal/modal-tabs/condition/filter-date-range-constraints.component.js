(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterDateRangeConstraints', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/condition/filter-date-range-constraints.component.html',
            controller: FilterDateRangeConstraintsController,
            controllerAs: 'vm',
            bindings: {
                dimension: '<',
                reload: '<',
                onDateChange: '&',
                condition: '<',
            }
        });

    FilterDateRangeConstraintsController.$inject = ['$scope'];

    function FilterDateRangeConstraintsController($scope) {
        var TAB_DAY = 0;
        var TAB_RANGE = 1;
        var TAB_DYNAMIC = 2;

        var DYNAMIC_DATE_RANGE_CONFIG = [
            {
                title: 'Last 7 days',
                period: {
                    months: 0,
                    days: 7
                }
            },
            {
                title: 'Last 30 days',
                period: {
                    months: 1,
                    days: 0
                }
            },
            {
                title: 'Last 90 days',
                period: {
                    months: 3,
                    days: 0
                }
            },
            {
                title: 'Last 365 days',
                period: {
                    months: 12,
                    days: 0
                }
            },
            {
                title: 'Week to date',
                period: {
                    months: 0,
                },
                toDate: 'isoWeek'
            },
            {
                title: 'Month to date',
                period: {
                    months: 0,
                },
                toDate: 'month'
            },
            {
                title: 'Quarter to date',
                period: {
                    months: 1,
                },
                toDate: 'quarter'
            },
            {
                title: 'Year to date',
                period: {
                    months: 0,
                },
                toDate: 'year'
            },
            {
                title: 'Custom X days',
                isCustom: true
            }
        ];

        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = $onChanges;
        vm.customDynamicDateRange = 0;
        vm.currentDimension = {};
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.onDynamicDateRangeChanged = onDynamicDateRangeChanged;
        vm.onCustomDynamicDateRangeChange = onCustomDynamicDateRangeChange;
        vm.dateRangeTab = 0;
        vm.currentDynamicDateRangeConfig = null;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;
        setDateRangeSubscription();

        ////////////////

        function onInit() {
        }

        function onDateRangeClick(tabIndex) {
            vm.dateRangeTab = tabIndex;
        }

        function onCustomDynamicDateRangeChange() {
            onInputChange();
        }

        function getStartDateRange() {
            var date = new Date();
            var config = vm.currentDynamicDateRangeConfig;
            if (config.isCustom) {
                date.setDate(date.getDate() - vm.customDynamicDateRange);
            } else if (config.toDate) {
                date = moment(date).startOf(config.toDate).toDate();
                date.setMonth(date.getMonth() - config.period.months);
            } else {
                date.setDate(date.getDate() - config.period.days);
                date.setMonth(date.getMonth() - config.period.months);
            }
            return date;
        }

        function onDynamicDateRangeChanged(config) {
            vm.currentDynamicDateRangeConfig = config;
            onInputChange();
        }

        function onInputChange() {
            if (vm.dateRangeTab === TAB_DAY) {
                var startDate = formatDate(resetTimezone(strToDate(vm.currentDimension.selected)));
                var endDate = formatDate(resetTimezone(endOfDay(strToDate(vm.currentDimension.selected))));
                console.log('filter-date-range-component: input change day', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                    activeTab: vm.dateRangeTab
                });
            } else if (vm.dateRangeTab === TAB_RANGE) {
                var startDate = formatDate(resetTimezone(strToDate(vm.currentDimension.selected)));
                var endDate = formatDate(resetTimezone(strToDate(vm.currentDimension.selected2)));
                console.log('filter-date-range-component: input change range', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                    activeTab: vm.dateRangeTab
                });
            } else if (vm.dateRangeTab === TAB_DYNAMIC) {
                var startDate = formatDate(resetTimezone(startOfDay(strToDate(getStartDateRange()))));
                var endDate = formatDate(resetTimezone(endOfDay(new Date())));
                console.log('filter-date-range-component: input change dynamic', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                    activeTab: vm.dateRangeTab
                });
            }
        }

        function setDateRangeSubscription() {
            if (vm.condition) {
                vm.currentDimension.selected = strToDate(vm.condition.value);
                vm.currentDimension.selected2 = strToDate(vm.condition.secondValue);
            }
        }

        function onDimensionChange(dimension) {
            console.log('date component: on changes before', dimension);
            vm.currentDimension = {
                selected: resetTimezone(strToDate(vm.condition.value)),
                selected2: resetTimezone(strToDate(vm.condition.secondValue)),
            };
            console.log('date component: on changes after-', vm.currentDimension.selected);
        }

        function onReloadChange() {
            onDimensionChange({ selected: null, selected2: null });
        }

        function $onChanges(changesObj) {
            if (changesObj.dimension) {
                onDimensionChange(vm.dimension);
            } else if (changesObj.reload) {
                onReloadChange();
            }
        }

        function resetTimezone(date) {
            if (!date) {
                return null;
            }
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }

        function strToDate(date) {
            if (!date) {
                return null;
            }
            // console.log('str to date', date, typeof date);
            return new Date(date);
        }

        function endOfDay(date) {
            if (!date) {
                return null;
            }
            date.setHours(23, 59, 59);
            return date;
        }

        function startOfDay(date) {
            if (!date) {
                return null;
            }
            date.setHours(0, 0, 0);
            return date;
        }

        function formatDate(date) {
            if (!date) {
                return null;
            }
            return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
        }

    }
})();