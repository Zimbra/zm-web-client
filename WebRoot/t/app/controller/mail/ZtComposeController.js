Ext.define('ZCS.controller.mail.ZtComposeController', {

	extend: "Ext.app.Controller",

	requires: [
		'ZCS.view.mail.ZtComposeForm'
	],

	config: {

		refs: {
			// event handlers
			composePanel: 'composepanel',

			// other
			mailView: '#' + ZCS.constant.APP_MAIL + 'view',
			composeForm: 'composepanel formpanel'
		},

		control: {
			composePanel: {
				cancel: 'doCancel',
				send: 'doSend'
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
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('field[name=body]');

		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});

		toFld.setValue(msg.getReplyAddress().getFullEmail());
		subjectFld.setValue(this.getSubject(msg, 'Re:'));
		bodyFld.setValue('\n\n' + '----- Original Message -----\n' + msg.get('content'));
		var textarea = bodyFld.element.query('textarea')[0];
		textarea.scrollTop = 0;
		bodyFld.focus();
	},

	replyAll: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('field[name=to]'),
			ccFld = form.down('field[name=cc]'),
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('field[name=body]');

		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});

		var userEmail = ZCS.session.getAccountName(),
			replyAddr = msg.getReplyAddress(),
			origToAddrs = msg.getAddressesByType(ZCS.constant.TO),
			origCcAddrs = msg.getAddressesByType(ZCS.constant.CC),
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
		}, this);

		toFld.setValue(replyAddr.getFullEmail());
		ccFld.setValue(ccAddrs.join('; '));
		subjectFld.setValue(this.getSubject(msg, 'Re:'));
		bodyFld.setValue('\n\n' + '----- Original Message -----\n' + msg.get('content'));
		bodyFld.focus();
		var textarea = bodyFld.element.query('textarea')[0];
		textarea.scrollTop = 0;
	},

	forward: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('field[name=body]');

		form.reset();
		panel.show({
			type: 'slide',
			direction: 'up'
		});
		subjectFld.setValue(this.getSubject(msg, 'Fwd:'));
		bodyFld.setValue('\n\n' + '----- Forwarded Message -----\n' + msg.get('content'));
		form.down('field[name=to]').focus();
	},

	getSubject: function(msg, prefix) {
		var subject = msg.get('subject'),
			pre = (subject.indexOf(prefix) === 0) ? '' : prefix + ' ';

		return pre + subject;
	},

	doCancel: function() {
		this.getComposePanel().hide();
	},

	doSend: function() {
		var values = this.getComposeForm().getValues();
//		Ext.getStore('ZtMsgStore').add(values);
		console.log('Send message');
		var msg = Ext.create('ZCS.model.mail.ZtMsg', {
			from: ZCS.session.getAccountName(),
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
			var mailView = this.getMailView();
			if (mailView) {
				mailView.add(this.composePanel);
			}
		}
		return this.composePanel;
	}
});
