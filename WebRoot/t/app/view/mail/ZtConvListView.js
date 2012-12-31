var itemTpl = "<div style='display:inline-block; width=20'>" +
			  "<img src='/t/resources/icons/" +
			  "<tpl if='isUnread'>unread.png<tpl else>read.png</tpl>' /></div>" +
			  "<tpl if='isUnread'>" +
			  "<span style='font-weight:bold'>{from}</span>" +
			  "<tpl else>" +
			  "<span>{from}</span>" +
			  "</tpl>" +
			  "<div>{subject} " +
			  "<tpl if='numMsgs &gt; 1'>({numMsgs})</tpl></div>";

Ext.define("ZCS.view.mail.ZtConvListView", {
	extend: "Ext.dataview.List",
	xtype: "convlistview",
	config: {
		loadingText: "Loading conversations ...",
		emptyText: "<div class=\"notes-list-empty-text\">No conversations found.</div>",
		itemTpl: itemTpl,
		scrollable : {
			direction: 'vertical',
			slotSnapSize : {
				y: 50
			}
		},
		listeners: {
			select: function(view, record) {
				this.fireEvent('showConv', view, record);
			}
		}
	}
});
