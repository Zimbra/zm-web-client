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

		var panel = this.getComposePanel(),
			form = panel.down('formpanel');

		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});
		form.down('field[name=to]').focus();
	},

	reply: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('field[name=to]'),
			bodyFld = form.down('field[name=body]');

		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});

		toFld.setValue(msg.getReplyAddress().getFullEmail());
		bodyFld.setValue('\n\n' + msg.get('content'));
		var textarea = bodyFld.element.query('textarea')[0];
		textarea.scrollTop = 0;
		bodyFld.focus();
	},

	replyAll: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('field[name=to]'),
			ccFld = form.down('field[name=cc]'),
			bodyFld = form.down('field[name=body]');

		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});

		var userEmail = ZCS.common.ZtUserSession.getAccountName(),
			replyAddr = msg.getReplyAddress(),
			origToAddrs = msg.getAddressesByType(ZCS.common.ZtConstants.TO),
			origCcAddrs = msg.getAddressesByType(ZCS.common.ZtConstants.CC),
			ccAddrs = [],
			used = {};

		// Remember emails we don't want to repeat in Cc
		// TODO: add aliases to used hash
		used[userEmail] = true;
		used[replyAddr.getEmail()] = true;

		Ext.each(origToAddrs.concat(origCcAddrs), function(addr) {
			if (!used[addr.getEmail()]) {
				ccAddrs.push(addr.getFullEmail());
			}
		});

		toFld.setValue(replyAddr.getFullEmail());
		ccFld.setValue(ccAddrs.join('; '));
		bodyFld.setValue('\n\n' + msg.get('content'));
		bodyFld.focus();
		var textarea = bodyFld.element.query('textarea')[0];
		textarea.scrollTop = 0;
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
