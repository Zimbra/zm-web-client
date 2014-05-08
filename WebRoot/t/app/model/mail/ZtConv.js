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
 * This class represents a conversation, which is made up of one or more messages.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.mail.ZtConv', {

	extend: 'ZCS.model.mail.ZtMailItem',

	requires: [
		'ZCS.model.mail.ZtConvReader',
		'ZCS.model.mail.ZtConvWriter'
	],

	config: {

		fields: [
			{ name: 'senders',  type: 'string' },
			{ name: 'numMsgs',  type: 'int' },

			// number of messages user will see in reading pane (which excludes Junk/Trash/Drafts)
			{
				name:       'numMsgsShown',
				type:       'int',
				convert:    function(value, record) {
					var numMsgs = 0;
					Ext.each(record.getMessages(), function(msg) {
						if (ZCS.model.mail.ZtConv.shouldShowMessage(msg)) {
							numMsgs++;
						}
					});
					return numMsgs;
				}
			}
		],

		proxy: {
			type: 'soapproxy',
			api: {
				create  : '',
				read    : urlBase + 'SearchRequest',
				update  : urlBase + 'ConvActionRequest',
				destroy : urlBase + 'ConvActionRequest'
			},
			reader: 'convreader',
			writer: 'convwriter'
		},

		messages:       [],
		folderHash:     {}
	},

	statics: {

		/**
		 * Returns true if the message is not in one of the folders we normally omit from conversation viewing (unless
		 * the user is currently viewing that folder), or if it is the only msg in the conv.
		 *
		 * Note: for an unloaded conv, this relies on an 8.5+ server.
		 *
		 * @param   {ZtMailMsg}     msg
		 * @returns {boolean}
		 */
		shouldShowMessage: function(msg) {

			var curFolder = ZCS.session.getCurrentSearchOrganizer(),
				curFolderId = curFolder ? curFolder.get('zcsId') : '',
				msgFolderId = msg instanceof ZCS.model.mail.ZtMailMsg ? msg.get('folderId') : msg.l,
				localId = ZCS.util.localId(msgFolderId),
				conv = ZCS.cache.get(msg.cid),
				isSolo = conv && conv.get('numMsgs') === 1;

			return (msgFolderId === curFolderId) || !ZCS.constant.CONV_HIDE[localId] || isSolo;
		}
	},

	constructor: function(data, id, raw) {

		// do this first so that 'numMsgsShown' can be calculated during construction
		if (data && data.msgs && data.msgs.length > 0) {
			this.setMessages(data.msgs);
		}

		// need to do this or get a JS error handling search results (see ZtItem ctor)
		return this.callParent(arguments) || this;
	},

	updateMessages: function(messages) {

		var folderHash = {},
			folderId;

		Ext.each(messages, function(message) {
			folderId = message.get('folderId');
			if (folderId) {
				folderHash[folderId] = true;
			}
		}, this);

		this.setFolderHash(folderHash);
	},

	/**
	 * Returns true if any msg in this conv is in the given folder.
	 *
	 * @param {string}  folderId
	 * @return {boolean}    true if any msg in this conv is in the given folder
	 */
	isInFolder: function(folderId) {
		return !!(this.getFolderHash()[folderId]);
	},

	handleModifyNotification: function(modify) {

        this.disableDefaultStoreEvents();

		this.callParent(arguments);

		if (modify.n) {
			this.set('numMsgs', modify.n);
		}
		if (modify.addresses) {
			this.set('addresses', modify.addresses);
		}
		if (modify.senders) {
			this.set('senders', modify.senders);
		}


		this.updateDependentLists();

		this.enableDefaultStoreEvents();
	}
});
