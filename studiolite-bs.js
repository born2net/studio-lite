define(['underscore', 'jquery', 'backbone', 'bootstrap'], function (_, $, Backbone, Bootstrap) {
    var StudioLite = Backbone.Router.extend({



        routes: {
            "help": "help",    // #help
            "search/:query": "search",  // #search/kiwis
            "search/:query/p:page": "search"   // #search/kiwis/p7
        },

        help: function () {
            alert('aa');
        },

        search: function (query, page) {
            require(["menuitemdetails"], function (empModelFactory) {
                var employee = new (empModelFactory['Employee']);
                employee.alertMe();
            });
        },


        initialize: function () {

            setTimeout(function () {
                $(window).trigger('resize');
                $('#wrap').animate({opacity: 1},550);
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

                $('#mainPanelWrap').removeClass('animateDivs');
                $('#propPanel').removeClass('animateDivs');

                var h = $('body').css('height').replace('px', '');
                var w = $('body').css('width').replace('px', '');

                h = h - 115;

                // fixed footer
                if (w <= 768) {
                    h = h + 65;
                }

                $('#propPanel').height(h);
                $('#mainPanel').height(h);
                $('#mainPanelWrap').height(h);

            });
        }
    })
    return StudioLite;
})