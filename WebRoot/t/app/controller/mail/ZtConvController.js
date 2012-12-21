Ext.define('ZCS.controller.mail.ZtConvController', {
	extend: 'ZCS.controller.ZtBaseController',
	config: {
		models: ['ZCS.model.mail.ZtMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],
		refs: {
			convToolbar: 'convtoolbar',
			msgListView: 'msglistview'
		},
		control: {

		}
	},
	launch: function () {
		this.callParent();
		console.log("launch ZtConvController");
	},
	init: function () {
		this.callParent();
		console.log("init ZtConvController");
	},
	onShowConvMenu: function() {
		console.log("Conv menu event caught");
	},
	showConv: function(conv) {
		console.log("conv controller: show conv " + conv.get('id'));
		var toolbar = this.getConvToolbar(),
			msg = 'message',
			label, num, msgStr;

//		label = toolbar.getComponent('convTitle');
//		if (label) {
//			label.setHtml(conv.get("subject"));
//		}
		toolbar.setTitle(conv.get("subject"));
//		label = toolbar.getComponent('msgCount');
		label = toolbar.down('label');
		if (label) {
			num = conv.get("numMsgs");
			msgStr = (num !== 1) ? Ext.util.Inflector.pluralize(msg) : msg;
			label.setHtml(num + " " + msgStr);
		}

		var store = this.getMsgListView().getStore();
		store.removeAll();
		store.load({convId: conv.get('id')});
	}
});
