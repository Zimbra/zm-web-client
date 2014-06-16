/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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

	requires: [
		'ZCS.model.calendar.ZtAppointmentReader',
		'ZCS.model.calendar.ZtAppointmentWriter'
	],

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
            { name: 'attendeeResponseMsg',  type: 'string' },
            { name: 'reminderAlert',        type: 'string' },
            { name: 'recurrence',           type: 'string' },
			{ name:	'fb', 					type: 'string' },
            { name: 'isException',          type: 'boolean'},
            { name: 'ms',                   type: 'int'},
            { name: 'rev',                  type: 'int'},
            //Needed in case of edit appointment
            { name: 'recur',                type: 'auto' },
            { name: 'startTime',            type: 'auto' },
            { name: 'endTime',              type: 'auto' },
			{ name: 'class',                type: 'string' },
			{ name: 'uid',                  type: 'string' },
			{ name: 'alarmData',            type: 'auto' },
			{ name: 'transp',               type: 'string' },
			{ name: 'isHtml',               type: 'boolean' },
            { name: 'oldCalFolderId',       type: 'string'} //Remember the folder the appt belonged to before moving
		],

        proxy: {
            type: 'soapproxy',
            api: {
                read: urlBase + 'SearchRequest',
                create: urlBase + 'CreateAppointmentRequest',
                update  : urlBase + 'ModifyAppointmentRequest'
            },

            reader: 'appointmentreader',
            writer: 'appointmentwriter'
        },

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
				apptFolderId:   comp.ciFolder,
				fb:				comp.fb
			});

			var	start = comp.s && comp.s[0],
				end = comp.e && comp.e[0],
				organizer,
                defaultTz = ZCS.timezone.getServerId(ZCS.timezone.DEFAULT_TZ),
                timezone = ZCS.timezone.getMediumName(defaultTz);

			// Use HTML description if available
			invite.set('notes', this.getNotes(comp));

			// Set content type
			invite.set('isHtml', !!(comp.descHtml && comp.descHtml[0] && comp.descHtml[0]._content));

			if (start) {
				invite.set('start', ZCS.model.mail.ZtInvite.getDateFromJson(start));
                invite.set('startTime', ZCS.model.mail.ZtInvite.getDateFromJson(start));
			}
			if (end) {
				invite.set('end', ZCS.model.mail.ZtInvite.getDateFromJson(end));
                invite.set('endTime', ZCS.model.mail.ZtInvite.getDateFromJson(end));
            }

            if (timezone) {
                invite.set('timezone', timezone);
            }

            if (comp.recur) {
                //Fix for bug: 82159
                invite.set('recurrence', ZCS.recur.getBlurb(comp));
                invite.set('recur', comp.recur)
            }

            if (comp.ex) {
                invite.set('isException', true);
            }

			if (comp.or) {
                organizer = ZCS.model.mail.ZtEmailAddress.fromInviteNode(comp.or);
                invite.set('organizer', organizer);
				if (comp.or.sentBy) {
					invite.set('sentBy', ZCS.model.mail.ZtEmailAddress.fromEmail(comp.or.sentBy));
				}
			}

            if (comp.alarm) {
                invite.set('reminderAlert',comp.alarm && comp.alarm[0] && comp.alarm[0].trigger[0].rel[0].m);
            }

            if (comp.at && comp.at.length) {
                var attendees = [],
					optAttendees = [],
					ln = comp.at.length, i, att, attList, email;

				for (i = 0; i < ln; i++) {
					att = comp.at[i];
					if (!att.cutype || (att.cutype === ZCS.constant.CUTYPE_INDIVIDUAL
                        || att.cutype === ZCS.constant.CUTYPE_RESOURCE || att.cutype === ZCS.constant.CUTYPE_ROOM)) {
						attList = (att.role === ZCS.constant.ROLE_OPTIONAL) ? optAttendees : attendees;
						email = ZCS.model.mail.ZtEmailAddress.fromInviteNode(att);
                        email.ptst = att.ptst;
                        if (!email.ptst) {
                            email.ptst = ZCS.model.mail.ZtInvite.getPtstFromReplies(node.replies, att.a);
                            if (!email.ptst) {
                                email.ptst = ZCS.constant.PSTATUS_UNKNOWN; //We don't know the status
                            }
                        }
                        attList.push(email);
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

                    invite.set('attendeeResponseMsg', Ext.String.format(inviteMsg, comp.at[0].d || comp.at[0].a)); // show address if display name is unavailable
                }
			}

			if (comp.status) {
				invite.set('status', comp.status);
			}

			if (comp['class']) { // using ['class'] to avoid build error as class is reserved word
				invite.set('class', comp['class']);
			}

			if (comp.uid) {
				invite.set('uid', comp.uid);
			}

			if (comp.alarm && comp.alarm.length) {
				invite.set('alarmData', comp.alarm);
			}

			if (comp.transp) {
				invite.set('transp', comp.transp);
			}

			var myResponse = node.replies && node.replies[0].reply[0].ptst;
			if (myResponse) {
				invite.set('myResponse', myResponse);
			}

			invite.setMsgId(msgId);

			return invite;
		},

        getPtstFromReplies: function(node, email) {
            if (!node || node.length !== 1) {
                return null;
            }
            var reply = node[0].reply;
            if (!reply) {
                return null;
            }
            for (var i = 0; i < reply.length; i++) {
                if (reply[i].at === email) {
                    return reply[i].ptst;
                }
            }
            return null;
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
				objType:    ZCS.constant.OBJ_INVITE,
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
				intendedFor:    ZCS.model.mail.ZtMailItem.convertAddressModelToObject(this.get('calendarIntendedFor')),
                timezone:       this.get('timezone'),
                recurrence:     this.get('recurrence'),
                isOrganizer:    this.get('isOrganizer'),
                attendeeResponse: this.get('attendeeResponse'),
                attendeeResponseMsg: this.get('attendeeResponseMsg'),

				acceptButtonId:     ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_ACCEPT }, idParams)),
				tentativeButtonId:  ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_TENTATIVE }, idParams)),
				declineButtonId:    ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_DECLINE }, idParams))
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
