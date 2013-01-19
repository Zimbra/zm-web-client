Ext.define('ZCS.view.mail.ZtMsgView', {

//	extend: 'Ext.Container',
//	extend: 'Ext.Panel',
	extend: 'Ext.dataview.component.ListItem',

	requires: [
		'ZCS.view.mail.ZtMsgHeader',
		'ZCS.view.mail.ZtMsgBody',
		'ZCS.view.mail.ZtMsgFooter'
	],

	xtype: 'msgview',

	config: {
//		layout: 'fit',
		msg: null,
//		html: 'Hello',
		items: [
			{
//				html: 'Howdy'
				xtype: 'msgheader'
			},
			{
				xtype: 'msgbody'
			},
			{
				xtype: 'msgfooter'
			}
		],
		listeners: {
			updatedata: function(msgView, msgData) {
				if (msgData) {
					console.log('updatedata for msg ' + msgData.id);
					var msg = this.up(ZCS.constant.APP_MAIL + 'itemview').getStore().getById(msgData.id);
					if (msg) {
//						msgView.displayMsg(msg);
						this.setMsg(msg);
						var msgHeader = msgView.down('msgheader');
						msgHeader.setContent(msg);
						var msgBody = msgView.down('msgbody');
						msgBody.setContent(msg);
					}
				}
			}
		}
	},

	displayMsg: function(msg) {

//		var msg = this.getMsg();
//		if (!msg) {
//			return;
//		}

		var msgHeader = {
//			xtype: 'msgheader',
			xtype: 'component',
			html: 'Header',
			msg: msg
		};
//		var msgHeader = Ext.create('ZCS.view.mail.ZtMsgHeader', {msg:msg});

		var msgBody = {
//			xtype: 'msgbody',
			xtype: 'component',
			html: 'Body',
			msg: msg
		};

		var msgFooter = {
//			xtype: 'msgfooter',
			xtype: 'component',
			html: 'Footer',
			msg: msg
		};

		this.add([
			msgHeader,
			msgBody,
			msgFooter
		]);
	}
});

