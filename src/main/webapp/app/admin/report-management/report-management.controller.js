(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User','schedulerService',
        'AlertService','pagingParams','paginationConstants','$location','$rootScope','$state','$uibModal',
        'AccountDispatch'
    ];

    function ReportManagementController(User,schedulerService,
        AlertService,pagingParams,paginationConstants,$location,$rootScope,$state,$uibModal,AccountDispatch) {
       
       var vm = this;

        vm.reports = [];
        
        vm.page = 1;
        vm.totalItems = null;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = 5;
        vm.transition = transition;
        
        
        vm.parseCron=parseCron;
        vm.executeNow=executeNow;
        vm.goToBuildPage=goToBuildPage;
        vm.deleteReport=deleteReport;
        vm.updateReport=updateReport;
        vm.serchReports=serchReports;
        vm.searchUser=searchUser;

        activate();
        ///////////////////////////////////////

        function activate() {
            getAccount(); 
            getScheduledReports(vm.account.login,"","",""); 
            var cronstrue = window.cronstrue; 
             
        }
        
        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin =  AccountDispatch.isAdmin();
        }

        function getScheduledReports(userName,reportName,startDate,endDate){
            schedulerService.filterScheduledReports(userName,reportName,startDate,endDate,vm.itemsPerPage,pagingParams.page - 1).then(
              function(response) {
                    vm.reports=response.data.records;
                    vm.totalItems = response.data.totalRecords;
                    vm.queryCount = vm.totalItems;
                    vm.page = pagingParams.page;
              },
              function(error) {
                var info = {
                    text: error.statusText,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
              });
        }

        function parseCron(cronExp){
            return cronstrue.toString(cronExp);
        }
        function executeNow(vizID){
            schedulerService.executeNow(vizID).then(
              function(response) {
                if (response.status==200){
                    var info = {
                    text: response.data.message,
                    title: "Success"
                    }
                    $rootScope.showSuccessToast(info);    
                }
              },
              function(error) {
                var info = {
                    text: error.statusText,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
              });

        }

        function goToBuildPage(build_url){
            var buildPage=build_url.split("#")[1];
            $location.path(buildPage);
        }

        function deleteReport(id){
            schedulerService.cancelScheduleReport(id).then(function (success) {
                var info = {
                    text: success.data.message,
                    title: "Cancelled"
                }
                $rootScope.showSuccessToast(info);
                getScheduledReports(vm.account.login,"","","");
            }).catch(function (error) {
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            });
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
            });
        }

        function serchReports(){
            var user = vm.userName ? vm.userName.login : "" ;
            vm.reportName = vm.reportName ? vm.reportName : "" ;
            vm.fromDate = vm.fromDate ? vm.fromDate : "" ;
            vm.toDate = vm.toDate ? vm.toDate : "" ;
            
            getScheduledReports(user,vm.reportName,vm.fromDate,vm.toDate);
        }

        function openScheduledReport(scheduledObj){
            $uibModal
            .open({
                templateUrl:
                    "app/entities/flair-bi/scheduler/scheduler-dialog.html",
                controller: "SchedulerDialogController",
                controllerAs: "vm",
                backdrop: "static",
                size: "lg",
                resolve: {
                    visualMetaData: function () {
                        return null;
                    },
                    datasource: function(){
                        return null;
                    },
                    view: function(){
                        return null;
                    },
                    dashboard: function(){
                        return null;
                    },
                    scheduledObj: function(){
                        return scheduledObj;
                    }
                }
            });
        }

        function updateReport(visualizationid){
            schedulerService.getScheduleReport(visualizationid).then(function (success) {
                if(success.status==200){
                    openScheduledReport(success.data);
                }
            }).catch(function (error) {
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }); 
        }

        function searchUser(e,searchedText) {
            e.preventDefault();
            if (searchedText) {
                User.search({
                    page: 0,
                    size: 10,
                    login: searchedText
                }, function (data) {
                    vm.users = data;
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.userManagement.error.users.all')
                    });
                });
            }
        }

    }
})();
