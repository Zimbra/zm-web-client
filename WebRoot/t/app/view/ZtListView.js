/**
 * Base class for a List view of items. Tapping an item displays it in the item panel.
 */
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
			},
			refresh: function(view, eOpts) {
				this.fireEvent('updateTitlebar');
			}
		}
	}
});
