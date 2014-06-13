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
		        if (store.data) {
	                store.data._autoSort = false;
	                store.suspendEvents();
		        }
        	});
        }
	},

	disableStoreSorting: function () {
		var stores = this.stores;
        if (Ext.isArray(stores)) {
        	Ext.each(stores, function (store) {
		        if (store.data) {
	                store.data._autoSort = false;
		        }
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
		        if (store.data) {
	                store.resumeEvents(true);
	                store.data._autoSort = true;
		        }
        	});
        }
	},

	enableStoreSorting: function () {
		var stores = this.stores;
        if (Ext.isArray(stores)) {
        	Ext.each(stores, function (store) {
		        if (store.data) {
	                store.data._autoSort = true;
		        }
        	});
        }
	},

	removeFromAssociatedStores: function () {
		var stores = this.stores;

		if (Ext.isArray(stores)) {
			Ext.each(stores, function (store) {
				store.remove(this);
			});
		}
	},

	sortAssociatedStores: function () {
		var stores = this.stores;

		if (Ext.isArray(stores)) {
			Ext.each(stores, function (store) {
				store.sort();
			});
		}
	},

	triggerStores: function () {
		var stores = this.stores;
		
		if (Ext.isArray(stores)) {
        	Ext.each(stores, function (store) {	
        		store.sort();
        	});
        }
	},

    /**
     * 
     * Modified from the base NodeInterface.
     *
	 * This is a sort that will sort the current model, and its children
	 * without repeatedly firing events that will tell the store that it needs
	 * to sort itself because a child node was sorted.  This basically resulted in N*N sorts where
	 * N is the number of nodes. 
	 *
	 *
     * Sorts this nodes children using the supplied sort function.
     * @param {Function} sortFn A function which, when passed two Nodes, returns -1, 0 or 1 depending upon required sort order.
     * @param {Boolean} suppressEvent Set to true to not fire a sort event.
     */
    sortWithoutEvents: function(sortFn, recursive, suppressEvent) {
        var cs  = this.childNodes,
            ln = cs.length,
            i, n;

        if (ln > 0) {
            Ext.Array.sort(cs, sortFn);
            for (i = 0; i < ln; i++) {
                n = cs[i];
                n.previousSibling = cs[i-1];
                n.nextSibling = cs[i+1];

                if (i === 0) {
                    this.setFirstChild(n);
                }
                if (i == ln - 1) {
                    this.setLastChild(n);
                }

                n.updateInfo(suppressEvent);

                if (recursive && !n.isLeaf()) {
                    n.sortWithoutEvents(sortFn, recursive, suppressEvent);
                }
            }
        }
    },

	/**
	 * Update specific items in the list instead of the whole list.
	 */
	updateDependentLists: function () {
		var model = this,
			components = this.getDependentLists();

		//For each list, only update the item that is bound to this model.
		Ext.Object.each(components, function (key, list) {
			var listItems = list.listItems;

			Ext.each(listItems, function (item) {
				if (item._record === model) {
					list.updateListItem(item, item.$dataIndex, list.getListItemInfo());
				}
			});
		});
	},

	refreshDependentLists: function () {
		var lists = this.getDependentLists();

		//For each list, only update the item that is bound to this model.
		Ext.Object.each(lists, function (key, list) {
			list.doRefresh();
		});
	},

	getDependentLists: function () {
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
		});

		return components;
	},

    /**
     * 
     * Copied from Nodeinterface, also makes the node updates silent which the base
     * implementation does not offer that option.
     *
	 * Removes all child nodes from this node.
	 * @param {Boolean} [destroy=false] `true` to destroy the node upon removal.
	 * @return {Ext.data.NodeInterface} this
	 */
	removeAllSilently: function () {


        var cn = this.childNodes,
            n;

        while ((n = cn[0])) {
            this.removeChild(n, true, true, true);
        }
        return this;
	}

});
