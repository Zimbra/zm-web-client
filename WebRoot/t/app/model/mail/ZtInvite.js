/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents an invite within the context of a mail message. Note that an invite
 * is not a type of mail message and does not extend ZtMailMsg. It is an optional part of a
 * mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtInvite', {

	extend: 'Ext.data.Model',

	config: {

		fields: [
			{ name: 'attendees',        type: 'auto' },
			{ name: 'optAttendees',     type: 'auto' },
			{ name: 'description',      type: 'string' },
			{ name: 'htmlDescription',  type: 'string' },
			{ name: 'start',            type: 'auto' },
			{ name: 'end',              type: 'auto' },
			{ name: 'isAllDay',         type: 'boolean' },
			{ name: 'location',         type: 'string' },
			{ name: 'organizer',        type: 'auto' },
			{ name: 'isOrganizer',      type: 'boolean' },
			{ name: 'sentBy',           type: 'auto' },
			{ name: 'status',           type: 'string' }
		],

		msgId: ''
	},

	statics: {

		/**
		 * Returns a ZtInvite constructed from the given JSON object.
		 *
		 * @param {object}  node    JSON invite node ('inv' within a mail msg)
		 * @return {ZtInvite}
		 */
		fromJson: function(node) {

			// assume there's only one invite component
			var comp = node.comp[0];

			var invite = new ZCS.model.mail.ZtInvite({
				isOrganizer:        !!comp.isOrg,
				location:           comp.loc,
				description:        comp.desc,
				htmlDescription:    comp.descHtml
			});

			var	start = comp.s && comp.s[0],
				end = comp.e && comp.e[0],
				organizer = ZCS.model.mail.ZtEmailAddress.fromInviteNode(comp.or);

			invite.set('isAllDay', !!comp.allDay);

			if (start) {
				invite.set('start', ZCS.model.mail.ZtInvite.getDateFromJson(start));
			}
			if (end) {
				invite.set('end', ZCS.model.mail.ZtInvite.getDateFromJson(end));
			}

			if (comp.or) {
				invite.set('organizer', ZCS.model.mail.ZtMailItem.convertAddressModelToObject(organizer));
			}

			if (comp.at && comp.at.length) {
				var attendees = [],
					optAttendees = [],
					ln = comp.at.length, i, att, attList;

				for (i = 0; i < ln; i++) {
					att = comp.at[i];
					if (!att.cutype || att.cutype === ZCS.constant.CUTYPE_INDIVIDUAL) {
						attList = (att.role === ZCS.constant.ROLE_OPTIONAL) ? optAttendees : attendees;
						attList.push(ZCS.model.mail.ZtEmailAddress.fromInviteNode(att));
					}
				}
				invite.set('attendees', ZCS.model.mail.ZtMailItem.convertAddressModelToObject(attendees));
				invite.set('optAttendees', ZCS.model.mail.ZtMailItem.convertAddressModelToObject(optAttendees));
			}

			return invite;
		},

		/**
		 * Converts a Zimbra date object to Date based on its contents. Dates come in at least two
		 * different formats: Unix time, or the special Zimbra date format.
		 *
		 * @param {object}  node        JSON date object
		 * @return {Date}
		 * @private
		 */
		getDateFromJson: function (node) {

			if (node.u) {
				return new Date(node.u);
			}
			else if (node.d) {
				return ZCS.util.convertZimbraDate(node.d);
			}
			else {
				Ext.Logger.warn('Unsupported date format: ' + JSON.stringify(node));
				return null;
			}
		}
	}
});
