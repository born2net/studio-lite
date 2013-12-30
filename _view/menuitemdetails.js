/**
 Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
 or a resource to be added to the currently selected timeline_channel
 @class MenuItemDetails
 @constructor
 @return {Object} instantiated AddBlockWizard
 **/
var MenuItemDetails = Backbone.View.extend({

    initOpts: function(){
      this.options.name = 'jambolia';
    },

    /**
     Returns this model's attributes as...
     @method setPlayerData
     @param {Number} i_playerData
     @return {Number} Unique clientId.
     **/
	render: function () {
		var markup = '<div>' +
		'<h1>' + this.options.name + '</h1>' +
		'<p><span class="label">' + this.options.category + '</span></p>' +
		'</div>'+'<h1>assa</h1>            <h1>assa</h1>            <h1>assa</h1>            <h1>assa</h1>            <h1>assa</h1>            <h1>assa</h1>            <h1>assa</h1>        <h1>assa</h1>  <h1>assa</h1>  <h1>assa</h1>  <h1>assa</h1>  <h1>assa</h1>  <h1>assa</h1>  <h1>assa</h1>  <h1>assa</h1>      <h1>assa</h1>            <h1>assa</h1>            <h1>assa</h1>';

		this.$el.html(markup);
		return this;
	}
});