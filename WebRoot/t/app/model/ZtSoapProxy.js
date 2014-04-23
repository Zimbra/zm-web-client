/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class is a simple SOAP proxy for talking to the Zimbra server.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtSoapProxy', {

	extend: 'Ext.data.proxy.Ajax',

	alias: 'proxy.soapproxy',

	/**
	 * Override so we can handle the inlined initial search results, which are then cleared so
	 * that we only do this once.
	 */
	doRequest: function(operation, callback, scope) {

		var me = this,
			inlineResults = ZCS.session.getInitialSearchResults();

		if (inlineResults) {

			// cobble together the appropriate request so that we can pretend it was used to get
			// these results
			var request = me.buildRequest(operation),
				response;

			operation.config.query = ZCS.session.getSetting(ZCS.constant.SETTING_INITIAL_SEARCH);

			request.setConfig({
				headers  : me.getHeaders(),
				timeout  : me.getTimeout(),
				method   : me.getMethod(request),
				callback : me.createRequestCallback(request, operation, callback, scope),
				scope    : me,
				proxy    : me
			});
			request.soapMethod = 'Search';

			var data = {
				Body: {
					SearchResponse: inlineResults
				}
			};

			// cobble together a response that contains the results we already have
			response = {
				request: request,
				requestId : request.id,
				status : 200,
				statusText : 'OK',
				getResponseHeader : function(header) {
					return '';
				},
				getAllResponseHeaders : function() {
					return {};
				},
				responseText : data
			};

			// Go!
			this.processResponse(true, operation, request, response, callback, scope);

			// Erase the canned results since we only do this once.
			ZCS.session.setInitialSearchResults(null);
		}
		else {
			return me.callParent(arguments);
		}
	},

	/**
	 * Process notifications and look for a refresh block. Continue polling.
	 */
	processResponse: function(success, operation, request, response, callback, scope) {

		if (success) {
			var query = operation.config.query;
			if (query) {
				var search = operation.config.search = Ext.create('ZCS.common.ZtSearch', {
						query: query
					}),
					orgId = search.getOrganizerId(),
					org = orgId && ZCS.cache.get(orgId),
					app = (org && org.get('app')) || ZCS.session.getActiveApp();

				ZCS.session.setSetting(ZCS.constant.SETTING_CUR_SEARCH, search, app);
				if (ZCS.session.getSetting(ZCS.constant.SETTING_SHOW_SEARCH)) {
					ZCS.session.getCurrentSearchField().setValue(query);
				}
			}
			this.callParent(arguments);
		}

		this.processResponse1(success, response, operation);
	},

	processResponse1: function(success, response, operation, options) {

		options = options || (operation && operation.config) || {};

		var data = this.getReader().getResponseData(response);

		if (success) {
			this.processHeader(data.Header);
			ZCS.app.getMainController().schedulePoll();
		}
		else if (!options.isPoll) {
			if (options.failure) {
				Ext.callback(options.failure, operation.config.scope, data);
			}
			ZCS.app.fireEvent('serverError', data);
		}
	},

	processHeader: function(header) {

		var context = header && header.context,
			session = context && context.session,
			changeToken = context && context.change && context.change.token,
			notifications = context && context.notify,
			refresh = context && context.refresh;

		if (session) {
			ZCS.session.setSessionId(session.id);
		}

		if (changeToken) {
			ZCS.session.setChangeToken(changeToken);
		}

		if (refresh) {
			ZCS.session.loadFolders(refresh);
			ZCS.session.setNotifySeq(0);
		}

		if (notifications && !ZCS.session.isStaleSession(session)) {
			this.handleNotifications(notifications);
		}

		if (refresh) {
			ZCS.app.getMainController().sendPoll();
			ZCS.app.fireEvent('notifyRefresh');
		}
	},

	handleNotifications: function(notifications) {

		Ext.each(notifications, function(notify) {
			if (notify.seq > ZCS.session.getNotifySeq()) {
				ZCS.session.setNotifySeq(notify.seq);
				this.normalizeNotifications(notify);
				if (notify.deleted) {
					this.handleDeletes(notify.deleted);
				}
				if (notify.created) {
					this.handleCreates(notify.created);
				}
				if (notify.modified) {
					this.handleModifies(notify.modified);
				}
			}
		}, this);
	},

	/**
	 * A delete notification indicates a 'hard delete', where an item has been removed from
	 * the server. Moving an item to Trash is a 'soft delete', and will generate a 'modified'
	 * notification indicating a move into the Trash folder.
	 *
	 * @param {String}   deleted        comma-separated list of deleted IDs
	 */
	handleDeletes: function(deleted) {

		var ids = deleted.id && deleted.id.split(','),
			notification;

		Ext.each(ids, function(id) {
			notification = {
				id:     id,
				type:   ZCS.constant.NOTIFY_DELETE
			};
			ZCS.app.fireEvent('notify', notification);
		}, this);
	},

	/**
	 * A create notification hands us the JSON node representing the item that was created.
	 *
	 * @param {Array}   creates     list of created item nodes
	 */
	handleCreates: function(creates) {

		Ext.each(ZCS.constant.NODES, function(nodeType) {
			Ext.each(creates[nodeType], function(notification) {
				notification.type = ZCS.constant.NOTIFY_CREATE;
				notification.nodeType = (nodeType === ZCS.constant.ORG_MOUNTPOINT) ? ZCS.constant.ORG_FOLDER : nodeType;
				notification.creates = creates; // conv needs to know about msg creates
				ZCS.app.fireEvent('notify', notification);
			}, this);
		}, this);
	},

	/**
	 * A modify notification will have properties only for the attributes that have changed
	 * for the item.
	 *
	 * @param {Array}   modifies        list of modified item nodes
	 */
	handleModifies: function(modifies) {

		Ext.each(ZCS.constant.NODES, function(nodeType) {
			Ext.each(modifies[nodeType], function(notification) {
				notification.type = ZCS.constant.NOTIFY_CHANGE;
				notification.nodeType = (nodeType === ZCS.constant.ORG_MOUNTPOINT) ? ZCS.constant.ORG_FOLDER : nodeType;
				ZCS.app.fireEvent('notify', notification);
			}, this);
		}, this);
	},

	/**
	 * Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
	 * For example, a virtual conv with ID -676 and one msg (ID 676) receives a second msg (ID 677)
	 * and becomes a real conv with an ID of 678. The following notifications will arrive:
	 *
	 *		deleted:	-676
	 *		created:	c {id:678, n:2}
	 *					m {id:677, cid:678}
	 *		modified:	m {id:676, cid:678}
	 *
	 * Essentially, we want to handle this as:
	 *
	 * 		created:	m {id:677, cid:678}
	 *		modified:	c {id:-676, _newId: 678}
	 * 					m {id:676, cid:678}
	 *
	 * The notifications object is modified in place.
	 *
	 * @adapts ZmMailApp.prototype.preNotify
	 * @private
	 */
	normalizeNotifications: function(notifications) {

		var deletes = notifications.deleted,
			creates = notifications.created,
			modifies = notifications.modified;

		if (!deletes || !creates || !modifies) {
			return notifications;
		}

		// first, see if we are deleting any virtual convs (which have negative local IDs)
		var virtConvDeleted = false,
			deletedIds = deletes.id && deletes.id.split(','),
			virtConv = {},
			newDeletedIds = [],
			localId;

		Ext.each(deletedIds, function(id) {
			localId = ZCS.util.localId(id);
			if (localId < 0) {
				virtConv[id] = true;
				virtConvDeleted = true;
			} else {
				newDeletedIds.push(id);
			}
		}, this);

		if (!virtConvDeleted) {
			return notifications;
		}

		// look for creates of convs that mean a virtual conv got promoted
		var gotNewConv = false,
			createdMsgs = {},
			createdConvs = {},
			fragments = {},
			name, create, id;

		for (name in creates) {
			Ext.each(creates[name], function(create) {
				id = create.id;
				if (name === ZCS.constant.NODE_MESSAGE) {
					createdMsgs[id] = create;
					fragments[create.cid] = create.fr;
				}
				else if (name === ZCS.constant.NODE_CONVERSATION && (create.n > 1)) {
					// this is *probably* a create for a real conv from a virtual conv
					createdConvs[id] = create;
					gotNewConv = true;
				}
			}, this);
		}

		if (!gotNewConv) {
			return notifications;
		}

		// last thing to confirm virt conv promotion is msg changing cid
		var msgMoved = false,
			newToOldCid = {},
			list = modifies.m,
			virtCid, msg, createdConv;

		Ext.each(list, function(mod) {
			localId = ZCS.util.localId(mod.id);
			virtCid = '-' + localId;
			createdConv = createdConvs[mod.cid];
			if (virtConv[virtCid] && createdConv) {
				msgMoved = true;
				newToOldCid[mod.cid] = virtCid;
				createdConv._wasVirtConv = true;
				createdConv.fr = fragments[mod.cid];
				msg = ZCS.cache.get(mod.id);
				if (msg) {
					msg.set('convId', mod.cid);
				}
			}
		}, this);

		if (!msgMoved) {
			return notifications;
		}

		// We're promoting virtual convs. Normalize the notifications object, and
		// process a preliminary notif that will update the virtual conv's ID to its
		// new value.

		// First, remove virt convs from the list of deleted IDs
		if (newDeletedIds.length) {
			notifications.deleted.id = newDeletedIds.join(',');
		} else {
			delete notifications.deleted;
		}

		// get rid of creates for promoted virtual convs, since they aren't really creates
		var tmp = [], createdConv;

		Ext.each(creates.c, function(create) {
			createdConv = createdConvs[create.id];
			if (createdConv && !createdConv._wasVirtConv) {
				tmp.push(create);
			}
		}, this);

		if (tmp.length > 0) {
			notifications.created.c = tmp;
		} else {
			delete notifications.created.c;
		}

		// If the conv's first msg didn't match the current search, then we won't have created
		// a ZtConv for it. Save the conv create node so we can use it to create a ZtConv if
		// the second msg matches the search.
		var msgCreate, convCreate;
		for (id in createdMsgs) {
			msgCreate = createdMsgs[id];
			convCreate = createdConvs[msgCreate.cid];
			if (convCreate && convCreate._wasVirtConv) {
				msgCreate.convCreateNode = convCreate;
			}
		}

		// Create modified notifs for the virtual convs that have been promoted, using
		// the create notif for the conv as a base. Notify now so that their IDs can
		// be updated, which makes it easier to handle subsequent notifications such
		// as the message create.
		var	cid, notification, conv;

		for (cid in newToOldCid) {
			notification = createdConvs[cid];
			notification.id = newToOldCid[cid];
			notification.newId = cid;
			notification.type = ZCS.constant.NOTIFY_CHANGE;
			notification.nodeType = ZCS.constant.NODE_CONVERSATION;
			// call this directly since we want it to happen immediately, and fireEvent() doesn't guarantee that
			ZCS.app.getConvController().handleConvChange(ZCS.cache.get(newToOldCid[cid]), notification);
		}
	},

	/**
	 * Sends a request to the server and processes the response's header, without being tied
	 * to any changes to data.
	 *
	 * @param {object}  options     request options (generally need to have at least 'url' and 'jsonData')
	 */
	sendSoapRequest: function(options) {

		var me = this;

		Ext.apply(options, {
			scope: options.scope || me,
			method: options.method || 'POST'
		});

		options.callback = Ext.Function.bind(me.processSoapResponse, me);

		Ext.Ajax.request(options);
	},

	processSoapResponse: function(options, success, response) {
		this.processResponse1(success, response, null, options);
	}
});
