define(['jquery', 'backbone'], function ($, Backbone) {

    var ApplicationView = Backbone.View.extend({

        initialize: function () {
            var self = this;
            this.m_name = '';

            if (this.el.id=='p3'){
                $(this.el).find('#next2').on('click',function(e){
                    self.options.appCoreStackView.slideToPage($('#p8')[0], 'right');
                    return false;
                });
            }


            $(this.el).find('#next').on('click',function(e){
                if (self.options.to==null)
                    return;
                self.options.appCoreStackView.slideToPage($(self.options.to)[0], 'right');
                return false;
            });
            $(this.el).find('#prev').on('click',function(e){
                if (self.options.from==null)
                    return;
                self.options.appCoreStackView.slideToPage($(self.options.from)[0], 'left');
                return false;
            });
        },

        alertMe: function () {
            alert('Ive been alerted' + Backbone);
        },

        render: function() {
            this.$el.css({display: 'block'})
            this.$el.text(this.m_name);
        }

    })


    return ApplicationView;

});

