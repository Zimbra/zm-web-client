Ext.define("ZCS.view.contacts.ZtContactsView", {
	extend: "Ext.Container",
	requires: "Ext.Panel",
	alias: "widget.contactsview",
	config: {
		layout: 'hbox',
		padding: 0,
		items: [
			{
				xtype: 'panel',
				flex: 1,
				items: [
					{
						html: 'Contacts List',
						centered: true
					}
				],
				border: 1,
				style: 'border-color: blue; border-style: solid;'
			},
			{
				xtype: 'panel',
				flex: 2,
				items: [
					{
						html: 'Contact View',
						centered: true
					}
				],
				border: 1,
				style: 'border-color: blue; border-style: solid;'
			}
		]
	}
});
