$(function () {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "list",
            "menu-items/new": "itemForm",
            "menu-items/:item": "itemDetails"
        },

        initialize: function () {
            this.menuItemModel = new MenuItemModel();
            this.menuItemView = new MenuItemDetails({
                el: '#MyMenu',
                model: this.menuItemModel
            });
        },

        list: function () {
            var self = this;
            $('#app').fadeOut(function () {
                $('#app').html('List screen').fadeIn();
            });
        },

        itemDetails: function (item) {
            var self = this;
            $('#app').fadeOut(function () {
                self.menuItemModel.set('name',item);
                $('#app').html(self.menuItemView.el);
                $('#app').fadeIn();
            });
        },

        itemForm: function () {
            $('#app').fadeOut(function () {
                $('#app').html('New form item').fadeIn();
            });
        }
    });

    var app = new AppRouter();

    $(function () {
        Backbone.history.start();
    });
});
