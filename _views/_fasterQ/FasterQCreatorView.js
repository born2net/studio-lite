/**
 Settings Backbone > View
 @class FasterQCreatorView
 @constructor
 @return {Object} instantiated FasterQCreatorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FasterQCreatorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._populateLines();
            return;

            var mod = Backbone.Model.extend({
                urlRoot: '/remoteValues',
                defaults: {
                    name: 'Sean',
                    last: 'Levy'
                }
            });

            Backbone.Collection.prototype.save = function (options) {
                Backbone.sync("create", this, options);
            };

            var col = Backbone.Collection.extend({
                url: '/remoteAllValues/123',
                model: mod
            });

            window.m = new mod({
                address: 'janlor'
            });

            window.m2 = new mod({
                address: 'randy',
                id: '1234'
            });

            window.c1 = new col(m2);
            window.c1.add(m);

            window.c2 = new col();
            window.c2.fetch();

            c1.save();

            setTimeout(function () {


                window.m2.fetch({att1: "value"}, {
                    success: function () {
                        window.m.set({credentials: BB.globs['CREDENTIALS']});
                        window.m.save();

                    }, error: function () {
                        log('saved failed');
                    }
                });

            }, 2000);

            setTimeout(function () {

                window.m.save({att1: "value"}, {
                    success: function () {
                        window.m.set({credentials: BB.globs['CREDENTIALS']});
                        window.m.save();

                    }, error: function () {
                        log('saved failed');
                    }
                });
            }, 3000);

            setTimeout(function () {

                m.on('destroy', function (e) {
                    log('model deleted 1');
                });
                m.destroy({
                    success: function (model, response) {
                        log('model deleted 2');
                        log(response);
                    }, error: function () {
                        log('error delete failed');
                    }
                });
            }, 6000)
        },

        _populateLines: function () {
            var self = this;
            require(['LinesCollection', 'LineModel'], function (LinesCollection, LineModel) {
                self.m_linesCollection = new LinesCollection();
                self.m_linesCollection.fetch({
                    success: function (models) {
                        log('model deleted 2');
                    }, error: function (err) {
                        log('error getting server data' + err);
                    }
                });
            });
        }
    });

    return FasterQCreatorView;
});

