Ext.define('ZCS.controller.mail.ZtComposeController', {

	extend: "Ext.app.Controller",

	requires: [
		'ZCS.view.mail.ZtComposeForm'
	],

	config: {
		refs: {
			mailView: 'mailview',
			composePanel: 'composepanel',
			composeForm: 'composepanel formpanel'
		},
		control: {
			composePanel: {
				cancelCompose: 'onCancelCompose',
				sendMessage: 'onSendMessage'
			}
		}
	},

	compose: function() {

		var panel = this.getComposePanel();
		var form = panel.down('formpanel');
		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});
		form.down('field[name=to]').focus();
	},

	reply: function(msg) {

		var panel = this.getComposePanel();
		var form = panel.down('formpanel');
		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});
//		form.down('field[name=to]').focus();
		form.down('field[name=body]').setValue(msg.get('content'));
	},

	onCancelCompose: function() {
		this.getComposePanel().hide();
	},

	onSendMessage: function() {
		var values = this.getComposeForm().getValues();
//		Ext.getStore('ZtMsgStore').add(values);
		console.log('Send message');
		var msg = Ext.create('ZCS.model.mail.ZtMsg', {
			from: ZCS.common.ZtUserSession.getAccountName(),
			to: values.to,
			subject: values.subject,
			content: values.body
		});
		msg.save();
		this.getComposePanel().hide();
	},

	// private
	getComposePanel: function() {
		if (!this.composePanel) {
			this.composePanel = Ext.create('ZCS.view.mail.ZtComposeForm');
//			var mailView = Ext.ComponentQuery.query('mailview')[0];
			var mailView = this.getMailView();
			if (mailView) {
				mailView.add(this.composePanel);
			}
		}
		return this.composePanel;
	}
});
