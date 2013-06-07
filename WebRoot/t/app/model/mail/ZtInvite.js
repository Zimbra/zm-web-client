/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 *
 * TODO: Do we want to cache invites? Usually we get them via owning messages.
 */
Ext.define('ZCS.model.mail.ZtInvite', {

	extend: 'Ext.data.Model',

	config: {

		fields: [
			{ name: 'id',                   type: 'string' },
			{ name: 'attendees',            type: 'auto' },
			{ name: 'optAttendees',         type: 'auto' },
			{ name: 'subject',              type: 'string' },
			{ name: 'description',          type: 'string' },
			{ name: 'htmlDescription',      type: 'string' },
			{ name: 'start',                type: 'auto' },
			{ name: 'end',                  type: 'auto' },
			{ name: 'isAllDay',             type: 'boolean' },
			{ name: 'location',             type: 'string' },
			{ name: 'organizer',            type: 'auto' },
			{ name: 'isOrganizer',          type: 'boolean' },
			{ name: 'sentBy',               type: 'auto' },
			{ name: 'status',               type: 'string' },
			{ name: 'method',               type: 'string' },
			{ name: 'myResponse',           type: 'string' },
			{ name: 'apptFolderId',         type: 'string' },
			{ name: 'calendarIntendedFor',  type: 'string' },
            { name: 'timezone',             type: 'string' },
            { name: 'attendeeResponse',     type: 'string' },
            { name: 'attendeeResponseMsg',         type: 'string' }
		],

		msgId: ''
	},

	statics: {

		/**
		 * Returns a ZtInvite constructed from the given JSON object.
		 *
		 * @param {object}  node    JSON invite node ('inv' within a mail msg)
		 * @param {string}  msgId   ID of owning message
		 * @return {ZtInvite}
		 */
		fromJson: function(node, msgId) {

			// assume there's only one invite component
			var comp = node.comp[0];

			var invite = new ZCS.model.mail.ZtInvite({
				id:             comp.apptId,
				subject:        comp.name,
				isOrganizer:    !!comp.isOrg,
				location:       comp.loc,
				isAllDay:       !!comp.allDay,
				method:         comp.method,
				apptFolderId:   comp.ciFolder
			});

			var	start = comp.s && comp.s[0],
				end = comp.e && comp.e[0],
				organizer = ZCS.model.mail.ZtEmailAddress.fromInviteNode(comp.or),
                defaultTz = ZCS.timezone.getServerId(ZCS.timezone.DEFAULT_TZ),
                timezone = ZCS.timezone.getMediumName(defaultTz);

			// Use HTML description if available
			invite.set('notes', this.getNotes(comp));

			if (start) {
				invite.set('start', ZCS.model.mail.ZtInvite.getDateFromJson(start));
			}
			if (end) {
				invite.set('end', ZCS.model.mail.ZtInvite.getDateFromJson(end));
			}

            if (timezone) {
                invite.set('timezone', timezone);
            }

			if (comp.or) {
				invite.set('organizer', organizer);
				if (comp.or.sentBy) {
					invite.set('sentBy', ZCS.model.mail.ZtEmailAddress.fromEmail(comp.or.sentBy));
				}
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
				invite.set('attendees', attendees);
				invite.set('optAttendees', optAttendees);


                if (comp.method == "REPLY" && invite.get('isOrganizer')) {
                    var attendeeResponse = comp.at[0].ptst,
                        inviteMsg;

                    invite.set('attendeeResponse', attendeeResponse);

                    switch (attendeeResponse){
                        case ZCS.constant.PSTATUS_ACCEPTED:
                            inviteMsg = ZtMsg.inviteMsgAccepted;
                            break;
                        case ZCS.constant.PSTATUS_TENTATIVE:
                            inviteMsg = ZtMsg.inviteMsgTentative;
                            break;
                        case ZCS.constant.PSTATUS_DECLINED:
                            inviteMsg = ZtMsg.inviteMsgDeclined;
                    }

                    invite.set('attendeeResponseMsg', Ext.String.format(inviteMsg, comp.at[0].d));
                }
			}

			var myResponse = node.replies && node.replies[0].reply[0].ptst;
			if (myResponse) {
				invite.set('myResponse', myResponse);
			}

			invite.setMsgId(msgId);

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
		getDateFromJson: function(node) {

			if (node.u) {
				return new Date(node.u);
			}
			else if (node.d) {
				return ZCS.util.convertZimbraDate(node.d);
			}
			else {
				//<debug>
                Ext.Logger.warn('Unsupported date format: ' + JSON.stringify(node));
                //</debug>
				return null;
			}
		},

		getNotes: function(comp) {

			var isHtml = false,
				notes = comp.descHtml && comp.descHtml[0] && comp.descHtml[0]._content,
				separator = ZCS.constant.INVITE_NOTES_SEPARATOR;

			if (notes) {
				isHtml = true;
			}
			else {
				notes = comp.desc && comp.desc[0] && comp.desc[0]._content;
			}

			if (!notes) {
				return '';
			}

			var sepIndex = notes.indexOf(separator);
			if (isHtml) {
				// For now, handle HTML as string and do replacement. If that's not sufficient, we'll
				// need to do something like ZmInviteMsgView.truncateBodyContent
				notes = (sepIndex === -1) ? notes : notes.substring(sepIndex + separator.length + 6);   // 6 is for </div>
				notes = notes.replace(/<\/body><\/html>/i, '');
			}
			else {
				notes = (sepIndex === -1) ? notes : notes.substring(sepIndex + separator.length);
				notes = ZCS.mailutil.textToHtml(Ext.String.trim(notes));
			}

			return notes || '';
		}
	},

	/**
	 * Returns content of this invite as HTML.
	 *
	 * @param {String}  msgBodyId   ID of owning ZtMsgBody
	 * @return {object}     inviteDesc to have invite description, content to have notes.
	 */
	getContentAsHtml: function(msgBodyId) {

		var	dateFormat = this.get('isAllDay') ? ZtMsg.invDateFormat : ZtMsg.invDateTimeFormat,
			idParams = {
				type:       ZCS.constant.IDTYPE_INVITE_ACTION,
				msgId:      this.getMsgId(),
				msgBodyId:  msgBodyId
			},
			data = {
				start:          Ext.Date.format(this.get('start'), dateFormat),
				end:            Ext.Date.format(this.get('end'), dateFormat),
				location:       this.get('location'),
				organizer:      ZCS.model.mail.ZtMailItem.convertAddressModelToObject(this.get('organizer')),
				sentBy:         ZCS.model.mail.ZtMailItem.convertAddressModelToObject(this.get('sentBy')),
				attendees:      ZCS.model.mail.ZtMailItem.convertAddressModelToObject(this.get('attendees')),
				optAttendees:   ZCS.model.mail.ZtMailItem.convertAddressModelToObject(this.get('optAttendees')),
				intendedFor:    this.get('calendarIntendedFor'),
                timezone:       this.get('timezone'),
                isOrganizer:    this.get('isOrganizer'),
                attendeeResponse: this.get('attendeeResponse'),
                attendeeResponseMsg: this.get('attendeeResponseMsg'),

				acceptButtonId:     ZCS.util.getUniqueId(Ext.apply({}, {
					action: ZCS.constant.OP_ACCEPT
				}, idParams)),
				tentativeButtonId:  ZCS.util.getUniqueId(Ext.apply({}, {
					action: ZCS.constant.OP_TENTATIVE
				}, idParams)),
				declineButtonId:    ZCS.util.getUniqueId(Ext.apply({}, {
					action: ZCS.constant.OP_DECLINE
				}, idParams))
            },
            invite = {};

		if (!this.isCanceled() && !this.get('isOrganizer') && this.hasReplyMethod()) {
			var myResponse = this.get('myResponse');
			data.myResponse = myResponse ? ZCS.constant.PSTATUS_TEXT[myResponse] : '';
		}
        if (!this.get('isOrganizer') && this.get('method') == "REQUEST") {
            data.showButtons = true;
        }
		invite.inviteDesc = ZCS.model.mail.ZtMailMsg.inviteDescTpl.apply(data);
        invite.content = ZCS.model.mail.ZtMailMsg.inviteNotesTpl.apply({notes: this.get('notes')});
        return invite;
	},

	/**
	 * Returns an HTML summary of this invite.
	 * @return {String} invite summary as HTML
	 */
	getSummary: function() {

		var out = [],
			i = 0,
			formatStr = "<tr><th align='left'>{0}</th><td>{1}</td></tr>\n",
			subject = this.get('subject'),
			subjectStr = !subject ? '' : Ext.String.htmlEncode(subject),
			organizer = this.get('organizer'),
			organizerEmail = organizer && organizer.getFullEmail(),
			organizerStr = !organizerEmail ? '' : Ext.String.htmlEncode(organizerEmail),
			location = this.get('location'),
			locationStr = !location ? '' : Ext.String.htmlEncode(location),
			attendees = this.get('attendees'),
			hasAttendees = attendees && attendees.length > 0,
			optAttendees = this.get('optAttendees'),
			hasOptAttendees = optAttendees && optAttendees.length > 0,
			attendeesStr = '';


		out[i++] = '<p>\n<table border="0">\n';
		out[i++] = Ext.String.format(formatStr, ZtMsg.invSubjectLabel, subjectStr);
		if (organizerStr) {
			out[i++] = Ext.String.format(formatStr, ZtMsg.invOrganizerLabel, organizerStr);
		}
		out[i++] = '\n';
		out[i++] = '</table>';
		out[i++] = '\n';
		out[i++] = "<p>\n<table border='0'>\n";
		if (locationStr) {
			out[i++] = Ext.String.format(formatStr, ZtMsg.invLocationLabel, locationStr);
		}
		if (hasAttendees || hasOptAttendees) {
			out[i++] = "</table>\n<p>\n<table border='0'>";
			out[i++] = '\n';
			if (hasAttendees) {
				Ext.each(attendees, function(attendee) {
					attendeesStr = attendee.get('email');
				}, this);
				out[i++] = Ext.String.format(formatStr, ZtMsg.invAttendeesLabel, attendeesStr);
			}
			if (hasOptAttendees) {
				attendeesStr = '';
				Ext.each(optAttendees, function(attendee) {
					attendeesStr = attendee.get('email');
				}, this);
				out[i++] = Ext.String.format(formatStr, ZtMsg.invOptAttendeesLabel, attendeesStr);
			}
		}
		out[i++] = '</table>';
		out[i++] = '<div>';
		out[i++] = ZCS.constant.INVITE_NOTES_SEPARATOR;
		// add <br> after DIV otherwise Outlook lops off 1st char
		out[i++] = '</div><br>';

		return out.join('');
	},

	hasReplyMethod: function() {
		var method = this.get('method');
		return !method || method === 'REQUEST' || method === 'PUBLISH';
	},

	isCanceled: function() {
		return this.get('apptFolder') === ZCS.constant.ID_TRASH;
	}
});
