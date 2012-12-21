Ext.define("ZCS.view.mail.ZtMsgListView", {
	extend: "Ext.dataview.List",
	xtype: "msglistview",
	config: {
		loadingText: "Loading messages ...",
		emptyText: "<div class=\"notes-list-empty-text\">No messages found.</div>",
		itemTpl: "<div>{content}</div>"
	}
});
