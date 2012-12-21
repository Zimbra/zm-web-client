Ext.define('ZCS.view.mail.ZtConvToolbar', {
	extend: 'Ext.TitleBar',
	xtype: 'convtoolbar',
	config: {
		docked: 'top',
		ui: 'light',
		items: [
/*
			{
				xtype: 'label',
				itemId: 'convTitle',
				style: 'margin-right: 10px; font-weight: bold;'
			},
*/
			{
				xtype: 'label',
//				itemId: 'msgCount',
				align: 'left'
			},
/*
			{
				xtype: 'spacer'
			},
*/
			{
				xtype: 'button',
				handler: function() {
					var mv = this.up('mailview');
					mv.fireEvent('showConvMenu', mv);
				},
				iconCls: 'arrow_down',
				iconMask: true,
				align: 'right'
			}
		]
	}
});
