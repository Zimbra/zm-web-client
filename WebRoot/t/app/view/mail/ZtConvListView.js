var itemTpl = "<span class='x-button-icon list x-icon-mask'></span>" +
			  "<tpl if='isUnread'>" +
			  "<span style='font-weight:bold'>{from}</span>" +
			  "<tpl else>" +
			  "<span>{from}</span>" +
			  "</tpl>" +
			  "<div>{subject} ({numMsgs})</div>";

Ext.define("ZCS.view.mail.ZtConvListView", {
	extend: "Ext.dataview.List",
	xtype: "convlistview",
	config: {
		loadingText: "Loading conversations ...",
		emptyText: "<div class=\"notes-list-empty-text\">No conversations found.</div>",
		itemTpl: itemTpl,
//		scrollable: {
//			direction: 'vertical'
//		},
		scrollable : {
			direction: 'vertical',
			slotSnapSize : {
				y:50
			},
			scroller : {
				listeners: {
					scroll : function(scroller, x, y) {
						console.log('scrolling!');
					}
				}
			}
		},
		listeners: {
			select: function(view, record) {
				this.fireEvent('showConv', view, record);
			}
		}
	}
});
