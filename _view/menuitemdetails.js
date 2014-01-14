define(function (require) {

    var $ = require('jquery'),
        Backbone = require('backbone'),

        Employee = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/employees",

            initialize: function () {
                this.reports = new EmployeeCollection();
                this.reports.url = {};
            },

            alertMe: function(){
                alert('Ive been alerted');
            }


        }),

        EmployeeCollection = Backbone.Collection.extend({

            model: Employee,

            url: "http://localhost:3000/employees"

        });

    return {
        Employee: Employee,
        EmployeeCollection: EmployeeCollection
    };

});