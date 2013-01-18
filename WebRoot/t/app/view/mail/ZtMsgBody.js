Ext.define('ZCS.view.mail.ZtMsgBody', {

	extend: 'Ext.Component',

	xtype: 'msgbody',

	config: {
		msg: null,
		padding: 5,
		tpl: Ext.create('Ext.XTemplate',
			'<tpl>',
			'<div>{content}</div>',
			'</tpl>'
		)
	},

	setContent: function() {
		var msg = this.getMsg();
		this.setHtml(this.getTpl().apply(msg.getData()));
	},

	getMsg: function() {
		return this.up('msgview').getMsg();
	}
});
