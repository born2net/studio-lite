define(['underscore', 'jquery', 'backbone', 'bootstrap', 'Elements'], function (_, $, Backbone, Bootstrap, Elements) {
    var StudioLite = Backbone.Router.extend({


        routes: {
            "help": "help",    // #help
            "search/:query": "search",  // #search/kiwis
            "search/:query/p:page": "search"   // #search/kiwis/p7
        },

        help: function () {

        },

        search: function (query, page) {
            require(["menuitemdetails"], function (empModelFactory) {
                var employee = new (empModelFactory['Employee']);
                var employees = new (empModelFactory['EmployeeCollection']);
                employee.alertMe();
                employees.alertMe();
            });
        },

        initialize: function () {

            Backbone.View = (function(View) {
                return View.extend({
                    constructor: function(options) {
                        this.options = options || {};
                        View.apply(this, arguments);
                    }
                });
            })(Backbone.View);

            require(['AppCoreStackView', 'ApplicationView', 'LoginView'], function (AppCoreStackView, ApplicationView, LoginView) {

                var applicationView = new Backbone.View({ el: Elements.APP_CONTENT});
                var loginView = new LoginView({el: Elements.APP_LOGIN});
                var appCoreStackView = new AppCoreStackView({el: Elements.APP_CORE_STACKVIEW});

                appCoreStackView.addChild(loginView);
                appCoreStackView.addChild(applicationView);
                appCoreStackView.selectIndex(0);
                // appCoreStackView.leanModal();

                setTimeout(function () {
                    appCoreStackView.selectIndex(1);
                }, 2000)

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p9',
                    el: '#p1',
                    to: '#p2'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p1',
                    el: '#p2',
                    to: '#p3'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p2',
                    el: '#p3',
                    to: '#p4'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p3',
                    el: '#p4',
                    to: '#p5'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p4',
                    el: '#p5',
                    to: '#p6'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p5',
                    el: '#p6',
                    to: '#p7'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p6',
                    el: '#p7',
                    to: '#p8'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p7',
                    el: '#p8',
                    to: '#p9'
                });

                new ApplicationView({
                    appCoreStackView: appCoreStackView,
                    from: '#p8',
                    el: '#p9',
                    to: '#p1'
                });


            })

            setTimeout(function () {
                $(window).trigger('resize');
            }, 50);

            Backbone.history.start();

            // Test open bootstrap modal
            $('#openPanel').on('click', function () {
                var w = $('body').css('width').replace('px', '');
                if (w <= 768) {
                    $(Elements.BS_MODAL).modal('show');
                    return;
                }
            });


            $(Elements.TOGGLE_PANEL).on('click', function () {
                if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')) {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.PROP_PANEL).fadeOut(function () {
                        $(Elements.TOGGLE_PANEL).html('<');
                        $(Elements.PROP_PANEL).addClass('hidden-sm hidden-md');
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-sm-9 col-md-9');
                        $(Elements.MAIN_PANEL_WRAP).addClass('col-md-12');
                    });
                } else {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.TOGGLE_PANEL).html('>');
                    $(Elements.MAIN_PANEL_WRAP).addClass('col-sm-9 col-md-9');
                    setTimeout(function () {
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-md-12');
                        $(Elements.PROP_PANEL).children().hide();
                        $(Elements.PROP_PANEL).removeClass('hidden-sm hidden-md');
                        $(Elements.PROP_PANEL).children().fadeIn();
                    }, 500)
                }
            });

            $(window).resize(function () {
                var h = $('body').css('height').replace('px', '');
                var w = $('body').css('width').replace('px', '');
                // reduce footer
                h = h - 115;
                if (w <= 768) {
                    $('#searcher').hide();
                } else {
                    $('#searcher').show();
                }

                $(Elements.PROP_PANEL).height(h);
                $(Elements.PROP_PANEL).height(h);
                $(Elements.MAIN_PANEL_WRAP).height(h);
            });
        }
    })
    return StudioLite;
})