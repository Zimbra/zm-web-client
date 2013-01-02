Ext.define("ZCS.controller.contacts.ZtContactListController", {

	extend: "ZCS.controller.ZtBaseController",

	config: {
		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],
		refs: {
			contactsView: 'contactsview',
			overview: 'contactsoverview',
			contactPanel: 'contactpanel',
			contactListView: 'contactlistview'
		},
		control: {
			contactsView: {
				showFolders: 'onShowFolders',
				compose: 'onCompose',
				search: 'onSearch'
			},
			contactListView: {
				showContact: 'onShowContact'
			},
			overview: {
				search: 'onSearch'
			}
		}
	},

	// TODO: this happens on startup; delay until Contacts tab shown
	launch: function () {
		this.callParent();
		Ext.getStore('ZtContactStore').load();
	},

	getContactController: function() {
		return ZCS.app.getController('ZCS.controller.contacts.ZtContactController');
	},

	onShowFolders: function() {
		console.log("Folders event caught");
		var overview = this.getOverview(),
			contactPanel = this.getContactPanel();

		if (overview.isHidden()) {
			contactPanel.setWidth('50%');
			// animation clears space then slides in (not great)
			overview.show({
				type: 'slide',
				direction: 'right',
				duration: 500
			});
//			overview.show();
		}
		else {
			// animation starts overview at far right (flex) or doesn't work at all (%) :(
//			overview.hide({
//				type: 'slide',
//				direction: 'left'
//			});
			contactPanel.setWidth('70%');
			overview.hide();
		}
	},

	onShowContact: function(view, contact) {
		this.getContactController().showContact(contact);
	},

	onSearch: function(query) {
		this.getContactController().clear();
		console.log('SearchRequest: ' + query);
		Ext.getStore('ZtContactStore').load({query: query});
	}
});
