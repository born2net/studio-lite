define(['jquery', 'backbone'], function ($, Backbone) {

    var Employee = Backbone.Model.extend({

            initialize: function () {
                this.reports = new EmployeeCollection();
                this.reports.url = {};
            },

            alertMe: function () {
                alert('Ive been alerted'+Backbone);
            }

        }),

        EmployeeCollection = Backbone.Collection.extend({
            model: Employee,

            alertMe: function(){
                alert('Ive been alerted2');
            }

        });

    return {
        Employee: Employee,
        EmployeeCollection: EmployeeCollection
    };

});
