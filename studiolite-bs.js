$(function () {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "list",
            "menu-items/new": "itemForm",
            "menu-items/:item": "itemDetails",
            "menu-items": "itemDetails"
        },

        initialize: function () {
            this.menuItemView = new MenuItemDetails();
            this.menuItemView.initOpts();
        },

        list: function () {
            var self = this;
            $('#app').fadeOut(function () {
                $('#app').html('List screen').fadeIn();
            });
        },

        itemDetails: function (item) {
            var self = this;
            if (item)
                self.menuItemView.options.name = item;
            $('#app').fadeOut(function () {
                $('#app').html(self.menuItemView.render().el).fadeIn();
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
