define(['underscore', 'jquery', 'backbone', 'bootstrap', 'bootbox', '../Elements', 'ComBroker', 'Lib'], function (_, $, Backbone, Bootstrap, Bootbox, Elements, ComBroker, Lib) {
    var StudioLite = Backbone.Router.extend({

        initialize: function () {

            var self = this;

            Backbone.View = (function (View) {
                return View.extend({
                    constructor: function (options) {
                        this.options = options || {};
                        View.apply(this, arguments);
                    }
                });
            })(Backbone.View);

            Backbone.comBroker = new ComBroker.module();
            Backbone.lib = new Lib.module();
            window.log = Backbone.lib.log;

            require(['AppEntryFaderView', 'LoginView', 'AppSliderView', 'CampaignSelectorView', 'CampaignView', 'ResolutionSelectorView', 'OrientationSelectorView', 'PopModal', 'WaitView'],
                function (AppEntryFaderView, LoginView, AppSliderView, CampaignSelectorView, CampaignView, ResolutionSelectorView, OrientationSelectorView, PopModal, WaitView) {

                    var appEntryFaderView = new AppEntryFaderView({
                        el: Elements.APP_ENTRY,
                        duration: 500
                    });

                    var test = new AppEntryFaderView({
                        el: '#test',
                        duration: 500
                    });

                    var v1 = new Backbone.View({el: '#first'})
                    var v2 = new Backbone.View({el: '#second'})
                    var v3 = new Backbone.View({el: '#third'})
                    test.addView(v1);
                    test.addView(v2);
                    test.addView(v3);
                    test.selectView(v1);

                    $('#firstButton').on('click',function(){
                        test.selectView(v1);
                    });
                    $('#secondButton').on('click',function(){
                        test.selectView(v2);
                    });
                    $('#thirdButton').on('click',function(){
                        test.selectView(v3);
                    });

                    var appSliderView = new AppSliderView({
                        el: Elements.APP_CONTENT
                    });

                    var loginView = new LoginView({
                        el: Elements.APP_LOGIN
                    });

                    var mainAppWaitView = new WaitView({
                        el: '#waitScreenApp'
                    });

                    var popModal = new PopModal({
                        el: Elements.POP_MODAL,
                        animation: 'slide_top', //or 'fade'
                        bgColor: 'white'

                    });

                    var md1 = new Backbone.View({el: '#stackViewModal1'});
                    var md2 = new Backbone.View({el: '#stackViewModal2'});
                    var md3 = new Backbone.View({el: '#stackWaitModalView'});
                    var md4 = new Backbone.View();
                    md4.$el.append('<b class="modal_close">hello world</b>');
                    $('body').append(md3.el);
                    popModal.addView(md1);
                    popModal.addView(md2);
                    popModal.addView(md3);
                    popModal.addView(md4);

                    var c = 0;
                    $('#someAction').on('click', function () {
                        if (c == 0)
                            popModal.selectView(md1);
                        if (c == 1)
                            popModal.selectView(md2);
                        if (c == 2)
                            popModal.selectView(md3);
                        if (c == 3)
                            popModal.selectView(md4);
                        if (c == 4)
                            popModal.selectView(md2);
                        c++;
                    });

                    appEntryFaderView.addView(loginView);
                    appEntryFaderView.addView(appSliderView);
                    appEntryFaderView.addView(mainAppWaitView);

                    appEntryFaderView.selectView(loginView);

                    setTimeout(function () {
                        appEntryFaderView.selectView(mainAppWaitView);
                    }, 2000);

                    setTimeout(function () {
                        appEntryFaderView.selectView(appSliderView);
                    }, 4000);


                    var campaignSelectorView = new CampaignSelectorView({
                        appCoreStackView: appSliderView,
                        from: '#campaign',
                        el: '#campaignSelector',
                        to: '#orientationSelector'
                    });

                    var orientationSelectorView = new OrientationSelectorView({
                        appCoreStackView: appSliderView,
                        from: '#campaignSelector',
                        el: '#orientationSelector',
                        to: '#resolutionSelector'
                    });


                    var resolutionSelectorView = new ResolutionSelectorView({
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

                    var waitView = new WaitView({
                        el: '#waitScreenMainPanel'
                    });


                    setTimeout(function () {
                        appSliderView.selectView(waitView);
                    }, 6000);

                    setTimeout(function () {
                        appSliderView.selectView(campaignSelectorView);
                    }, 12000);

                    appSliderView.addView(waitView);
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

            $('#openPanel').on('click', function () {
                //var w = $('body').css('width').replace('px', '');
                //if (w <= 768) {
                self.testBootbox();
                //}
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
        },

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

        testBootbox: function () {

            Bootbox.prompt("What is your name?", function (result) {
                if (result === null) {
                    log("Prompt dismissed");
                } else {
                    log("Hi <b>" + result + "</b>");
                }
            });

            Bootbox.dialog({
                message: "I am a custom dialog",
                title: "Custom title",
                buttons: {
                    success: {
                        label: "Success!",
                        className: "btn-success",
                        callback: function () {
                            log("great success");
                        }
                    },
                    danger: {
                        label: "Danger!",
                        className: "btn-danger",
                        callback: function () {
                            log("uh oh, look out!");
                        }
                    },
                    main: {
                        label: "Click ME!",
                        className: "btn-primary",
                        callback: function () {
                            log("Primary button");
                        }
                    }
                }
            });


            Bootbox.confirm("Are you sure?", function (result) {
                log("Confirm result: " + result);
            });
        }
    });
    return StudioLite;
});