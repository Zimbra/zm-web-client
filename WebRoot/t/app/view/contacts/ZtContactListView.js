var itemTpl =
	"<span style='font-weight:bold'>{lastName}, {firstName}</span>";

Ext.define("ZCS.view.contacts.ZtContactListView", {
	extend: "Ext.dataview.List",
	xtype: "contactlistview",
	config: {
		loadingText: "Loading contacts ...",
		emptyText: "<div class=\"notes-list-empty-text\">No contacts found.</div>",
		itemTpl: itemTpl,
		scrollable : {
			direction: 'vertical',
			slotSnapSize : {
				y: 50
			}
		},
		listeners: {
			select: function(view, record) {
				this.fireEvent('showContact', view, record);
			}
		}
	}
});
