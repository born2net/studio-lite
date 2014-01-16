define(['underscore', 'jquery', 'backbone', 'bootstrap'], function (_, $, Backbone, Bootstrap) {
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

            require(['AppCoreStackView', 'ApplicationView', 'LoginView', 'Elements'], function (AppCoreStackView, ApplicationView, LoginView, Elements) {


                var applicationView = new ApplicationView({ el: '#AppContent' });
                var loginView = new LoginView({el: '#AppLogin'});
                var appCoreStackView = new AppCoreStackView({el: Elements.APP_CORE_STACKVIEW});

                appCoreStackView.addChild(loginView);
                appCoreStackView.addChild(applicationView);
                appCoreStackView.selectIndex(0);
                appCoreStackView.leanModal();

                setTimeout(function(){
                    appCoreStackView.selectIndex(1);
                },2000)



            })

            setTimeout(function () {
                $(window).trigger('resize');
            }, 50);

            Backbone.history.start();

            $('#closePanel').click(function () {
                $('#propPanel').fadeOut(function () {
                    $('#propPanel').addClass('hidden-sm hidden-md');
                    $('#mainPanelWrap').removeClass('col-sm-9 col-md-9');
                    $('#mainPanelWrap').addClass('col-md-12');
                });
            });

            $('#openPanel').click(function () {

                var w = $('body').css('width').replace('px', '');
                if (w <= 768) {
                    $('#myModal').modal('show');
                    return;
                }

                $('#mainPanelWrap').addClass('col-sm-9 col-md-9');
                setTimeout(function () {
                    $('#mainPanelWrap').removeClass('col-md-12');
                    $('#propPanel').children().hide();
                    $('#propPanel').removeClass('hidden-sm hidden-md');
                    $('#propPanel').children().fadeIn();
                }, 500)

                return
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

                $('#propPanel').height(h);
                $('#mainPanel').height(h);
                $('#mainPanelWrap').height(h);
            });
        }
    })
    return StudioLite;
})