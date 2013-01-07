Ext.define('ZCS.view.ZtListView', {

	extend: 'Ext.dataview.List',

	config: {
		scrollable : {
			direction: 'vertical',
			slotSnapSize : {
				y: 50
			}
		},
		listeners: {
			select: function(view, record) {
				this.fireEvent('showItem', view, record);
			}
		}
	}
});
