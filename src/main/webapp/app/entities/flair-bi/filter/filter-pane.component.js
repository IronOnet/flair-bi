(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterPaneComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-pane.component.html',
            controller: filterPaneController,
            controllerAs: 'vm',
            bindings: {
                dimensions: '=',
                view: '=',
                type: '@',
                tab: '=',
                iframes: '='
            }
        });

    filterPaneController.$inject = ['$scope', '$rootScope', 'filterParametersService', 'FilterStateManagerService', 'VisualDispatchService','SEPARATORS'];

    function filterPaneController($scope, $rootScope, filterParametersService, FilterStateManagerService, VisualDispatchService,SEPARATORS) {
        var vm = this;

        vm.filter = filter;
        vm.onClearClick = onClearClick;
        vm.onFilterClick = onFilterClick;
        vm.selectedFilters = {};
        vm.list = {};
        vm.dateFilter = [];
        vm.separators = SEPARATORS;
        vm.separator =  vm.separators[0];

        activate();

        ////////////////

        function activate() {
            filterClearSubscription();
            filterChangedSubscription();
        }

        function filterClearSubscription() {
            var unsub = $scope.$on('flairbiApp:clearFilters', function () {
                clear();
            });

            $scope.$on('$destroy', unsub);
        }

        function filterChangedSubscription() {
            var unsubscribe = $scope.$on('filterParametersService:filter-changed', function (event, newFilter) {
                vm.selectedFilters = newFilter;
                //setFilterInIframeURL(vm.selectedFilters);
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function onClearClick() {
            $rootScope.$broadcast("flairbiApp:clearFilters");
            $rootScope.$broadcast("flairbiApp:clearFiltersClicked");
        }

        function onFilterClick() {
            filter();
            $rootScope.$broadcast("flairbiApp:filterClicked");
        }

        function clear() {
            $rootScope.updateWidget = {};
            if (vm.dimensions) {
                vm.dimensions.forEach(function (item) {
                    if (!filterParametersService.isDateType(item)) {
                        item.selected = null;
                        item.selected2 = null;
                        item.metadata = {};
                        item.metadata.dateRangeTab = 0;
                        item.metadata.currentDynamicDateRangeConfig = null;
                        item.metadata.customDynamicDateRange = 0;
                        item.commaSeparatedValues = '';
                    } else {
                        item.selected = null;
                        item.selected2 = null;
                    }
                });
                filterParametersService.clear();
                filterParametersService.saveSelectedFilter($rootScope.updateWidget);
                filter();
                filterParametersService.removeFilterInIframeURL(vm.iframes);
            }
        }

        function filter() {
            filterParametersService.save(filterParametersService.getSelectedFilter());
            $rootScope.updateWidget = {};
            $rootScope.$broadcast('flairbiApp:filter');
            $rootScope.$broadcast('flairbiApp:filter-add');
            addFilterInIframeURL();
        }

        function addFilterInIframeURL() {
            var filters = filterParametersService.getSelectedFilter();
            filterParametersService.setFilterInIframeURL(filters,vm.iframes,vm.view.viewDashboard.dashboardDatasource.id.toString(),vm.dimensions);
        }
    }
})();
