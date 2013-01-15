Ext.define('ZCS.view.mail.ZtMsgListView', {

//	extend: 'Ext.Container',
//	extend: 'Ext.Panel',
	extend: 'Ext.dataview.List',

	requires: [
		'ZCS.view.mail.ZtMsgView'
	],

	xtype: 'msglistview',

//	layout: 'fit',

	config: {
		useComponents: true,
		defaultType: 'msgview',
		scrollable: {
			direction: 'vertical'
		},
		msgList: null
	},

	updateMsgList: function(msgs) {
//		this.removeAll();
//		this.setHtml("Holy crap, " + msgs.length + " messages!");
		this.add({
			html: "Holy shit, " + msgs.length + " messages!"
		});
		return;
		Ext.each(msgs, function(msg) {
			var msgView = new ZCS.view.mail.ZtMsgView();
			msgView.setMsg(msg);
			this.add(msgView);
		}, this);
	}
});
