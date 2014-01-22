define(['underscore', 'jquery', 'backbone', 'bootstrap', 'Elements', 'ComBroker', 'Lib'], function (_, $, Backbone, Bootstrap, Elements, ComBroker, Lib) {
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

            Backbone.comBroker = new ComBroker.module();
            Backbone.lib = new Lib.module();
            window.log = Backbone.lib.log;

            // add the now removed "options" back into backbone View
            Backbone.View = (function (View) {
                return View.extend({
                    constructor: function (options) {
                        this.options = options || {};
                        View.apply(this, arguments);
                    }
                });
            })(Backbone.View);



            require(['AppEntryFaderView', 'LoginView', 'AppSliderView', 'CampaignSelectorView', 'CampaignView', 'ResolutionSelectorView', 'OrientationSelectorView', 'PopModal'],
                function (AppEntryFaderView, LoginView, AppSliderView, CampaignSelectorView, CampaignView, ResolutionSelectorView, OrientationSelectorView, PopModal) {

                    var appEntryFaderView = new AppEntryFaderView({
                        el: Elements.APP_ENTRY,
                        duration: 500
                    });

                    var appSliderView = new AppSliderView({
                        el: Elements.APP_CONTENT
                    });

                    var loginView = new LoginView({
                        el: Elements.APP_LOGIN
                    });

                    var popModal = new PopModal({
                        el: Elements.POP_MODAL,
                        animation: 'slide_top', //or 'fade'
                        bgColor: 'white'

                    });

                    var md1 = new Backbone.View({el: '#stackViewModal1'});
                    var md2 = new Backbone.View({el: '#stackViewModal2'});
                    var md3 = new Backbone.View();
                    md3.$el.append('<b class="modal_close">hello world</b>');
                    $('body').append(md3.el);
                    popModal.addView(md1);
                    popModal.addView(md2);
                    popModal.addView(md3);

                    var c = 0;
                    $('#someAction').on('click', function () {
                        if (c == 0)
                            popModal.selectView(md1);
                        if (c == 1)
                            popModal.selectView(md2);
                        if (c == 2)
                            popModal.selectView(md3);
                        if (c == 3)
                            popModal.selectView(md1);
                        if (c == 4)
                            popModal.selectView(md2);
                        c++;
                    });

                    appEntryFaderView.addView(loginView);
                    appEntryFaderView.addView(appSliderView);

                    appEntryFaderView.selectView(loginView);
                    setTimeout(function () {
                        appEntryFaderView.selectView(appSliderView);
                    }, 2000);


                    var campaignSelectorView = new CampaignSelectorView({
                        appCoreStackView: appSliderView,
                        from: '#campaign',
                        el: '#campaignSelector',
                        to: '#orientationSelector'
                    });

                    var resolutionSelectorView = new ResolutionSelectorView({
                        appCoreStackView: appSliderView,
                        from: '#campaignSelector',
                        el: '#orientationSelector',
                        to: '#resolutionSelector'
                    });

                    var orientationSelectorView = new OrientationSelectorView({
                        appCoreStackView: appSliderView,
                        from: '#orientationSelector',
                        el: '#resolutionSelector',
                        to: '#campaign'
                    });

                    var campaignView = new CampaignView({
                        appCoreStackView: appSliderView,
                        from: '#resolutionSelector',
                        el: '#campaign',
                        to: '#campaignSelector'
                    });

                    appSliderView.addView(campaignSelectorView);
                    appSliderView.addView(campaignView);
                    appSliderView.addView(resolutionSelectorView);
                    appSliderView.addView(orientationSelectorView);
                    appSliderView.selectView(campaignSelectorView);
                });

            setTimeout(function () {
                $(window).trigger('resize');
            }, 50);

            Backbone.history.start();

            // Test open bootstrap modal
            $('#openPanel').on('click', function () {
                var w = $('body').css('width').replace('px', '');
                if (w <= 768) {
                    $(Elements.BS_MODAL).modal('show');
                }
            });


            $(Elements.TOGGLE_PANEL).on('click', function () {
                if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')) {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.PROP_PANEL_WRAP).fadeOut(function () {
                        $(Elements.TOGGLE_PANEL).html('<');
                        $(Elements.PROP_PANEL_WRAP).addClass('hidden-sm hidden-md');
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-sm-9 col-md-9');
                        $(Elements.MAIN_PANEL_WRAP).addClass('col-md-12');
                    });
                } else {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.TOGGLE_PANEL).html('>');
                    $(Elements.MAIN_PANEL_WRAP).addClass('col-sm-9 col-md-9');
                    setTimeout(function () {
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-md-12');
                        $(Elements.PROP_PANEL_WRAP).children().hide();
                        $(Elements.PROP_PANEL_WRAP).removeClass('hidden-sm hidden-md');
                        $(Elements.PROP_PANEL_WRAP).children().fadeIn();
                    }, 500)
                }
            });

            $(window).resize(function () {
                var b = $('body');
                var h = b.css('height').replace('px', '');
                var w = b.css('width').replace('px', '');
                // reduce footer
                h = h - 115;
                if (w <= 768) {
                    $('#searcher').hide();
                } else {
                    $('#searcher').show();
                }
                $(Elements.PROP_PANEL_WRAP).height(h);
                $(Elements.MAIN_PANEL_WRAP).height(h);
                $(Elements.APP_NAVIGATOR).height(h);

            });
        }
    });
    return StudioLite;
});