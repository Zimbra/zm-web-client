Ext.define("ZCS.view.mail.ZtMsgListView", {
//	extend: "Ext.dataview.List",
	extend: "Ext.dataview.DataView",
	xtype: "msglistview",
	config: {
		loadingText: "Loading messages ...",
		itemTpl: "<div>{content}</div><hr>"
	}
});
