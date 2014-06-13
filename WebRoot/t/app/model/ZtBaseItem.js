Ext.define('ZCS.model.ZtBaseItem', {
	extend: 'Ext.data.Model',

	/**
	 * Use this function when lists which may contain many items are dependent on this model.
	 */
	disableDefaultStoreEvents: function () {
		var stores = this.stores;
		//We are disabling any type of store to view data binding for this update
        //that is because in general, Sencha Touch decides to re-render a whole list
        //if any single item in it changes.  This is wasteful, and very slow.
        //Instead, we will update single items as necessary.
        if (Ext.isArray(stores)) {
        	Ext.each(stores, function (store) {
        		store.suspendEvents();
        	});
        }
	},

	/** 
	  * Call this after updates to the model are done.
	  */
	enableDefaultStoreEvents: function () {
		var stores = this.stores;
        if (Ext.isArray(stores)) {
        	Ext.each(stores, function (store) {
        		store.resumeEvents(true);
        	});
        }
	},

	/**
	 * Update specific items in the list instead of the whole list.
	 */
	updateDependentLists: function () {
		var components = {},
			model = this,
			stores = this.stores;

		//Collect references to all the lists that are dependent on this model.
		Ext.each(stores, function (store) {
			var listenerMap = store.getEventDispatcher().listenerStacks[store.observableType][store.getObservableId()];

			if (listenerMap.refresh && listenerMap.refresh.length > 0) {
				var listeners = listenerMap.refresh.listeners.current;

				Ext.each(listeners, function (listener) {
					var component = listener.scope;

					if (component instanceof Ext.dataview.List) {
						components[component._itemId] = component;
					}
				});
			}
		})

		//For each list, only update the item that is bound to this model.
		Ext.Object.each(components, function (key, list) {
			var listItems = list.listItems;

			Ext.each(listItems, function (item) {
				if (item._record === model) {
					list.updateListItem(item, list.topRenderedIndex, list.getListItemInfo());
				}
			})
		});
	}

});