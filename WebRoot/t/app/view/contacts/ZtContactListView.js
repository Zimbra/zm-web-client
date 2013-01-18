var itemTpl =
	"<span style='font-weight:bold'>{lastName}, {firstName}</span>";

Ext.define('ZCS.view.contacts.ZtContactListView', {

	extend: 'ZCS.view.ZtListView',

	xtype: ZCS.constant.APP_CONTACTS + 'listview',

	config: {
		loadingText: "Loading contacts ...",
		emptyText: "<div class=\"notes-list-empty-text\">No contacts found.</div>",
		itemTpl: itemTpl
	}
});
