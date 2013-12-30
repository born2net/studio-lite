var MenuItemDetails = Backbone.View.extend({

    initOpts: function(){
      this.options.name = 'jambolia';
    },
	render: function () {
		var markup = '<div>' +
		'<h1>' + this.options.name + '</h1>' +
		'<p><span class="label">' + this.options.category + '</span></p>' +
		'</div>';

		this.$el.html(markup);
		return this;
	}
});