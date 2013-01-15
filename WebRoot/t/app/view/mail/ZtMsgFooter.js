Ext.define('ZCS.view.mail.ZtMsgFooter', {

	extend: 'Ext.Toolbar',

	xtype: 'msgfooter',

	config: {
		msg: null,
		docked: 'bottom',
		overlay: true,
		cls: 'zcs-msg-footer',
		items: [
			{
				xtype: 'spacer'
			},
			{
				xtype: 'button',
				iconCls: 'reply',
				iconMask: true,
				handler: function(a, b, c) {
					this.up('msgfooter').fireEvent('reply', this.up('msgview').getMsg());
				}
			},
			{
				xtype: 'button',
				iconCls: 'replytoall',
				iconMask: true,
				handler: function() {
					this.up('msgfooter').fireEvent('replyAll', this.up('msgview').getMsg());
				}
			},
			{
				xtype: 'button',
				iconCls: 'trash',
				iconMask: true,
				handler: function() {
					this.up('msgfooter').fireEvent('delete', this.up('msgview').getMsg());
				}
			},
			{
				xtype: 'button',
				iconCls: 'arrow_down',
				iconMask: true,
				handler: function() {
					this.up('msgfooter').fireEvent('showMenu', this.up('msgview').getMsg());
				}
			}
		]
	}
});
