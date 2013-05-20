/*
 * ***** BEGIN LICENSE BLOCK *****
 *
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
 *
 * ***** END LICENSE BLOCK *****
 */
# Very simple templates file. Each template has an ID. In JS, it is available as
# ZCS.template.[id] after this file has been loaded and processed.
#
# In this file:
#   - any line that starts with a # is a comment
#   - beginning and trailing space are trimmed during processing
#
# In general, a template that begins with <tpl> is an XTemplate, and one that does
# not is an itemTpl.

<template id='ConvListItem'>
	<div class='zcs-mail-list'>
		<tpl if='isInvite'>
		<div class='zcs-mail-invitation'>
			<img src='/t/resources/images/invitation<tpl if='isUnread'>_unread</tpl>.png' />
		</div>
		<tpl else>
		<div class='zcs-mail-readState'>
			<img src='/t/resources/images/<tpl if='isUnread'>un</tpl>read.png' />
		</div>
		</tpl>
		<div class='zcs-mail-senders<tpl if='isUnread'>-unread</tpl>'>
			{senders}
		</div>
		<div class='zcs-mail-date'>{dateStr}</div>
		<tpl if='hasAttachment'><div class='zcs-mail-attachment'>
			<img src='/t/resources/images/attachment.png' /></div></tpl>
		<div class='zcs-mail-subject<tpl if='isUnread'>-unread</tpl>'>{[Ext.String.htmlEncode(values.subject)]}</div>
		<tpl if='numMsgs &gt; 1'><span class='zcs-numMsgs'>{numMsgs}</span></tpl>
		<tpl if='isFlagged'><div class='zcs-mail-flag'>
			<img src='/t/resources/images/flagged.png' /></div></tpl>
		<div class='zcs-mail-fragment'>{[Ext.String.htmlEncode(values.fragment)]}</div>
	</div>
</template>

# In the message header templates below, the values FROM, TO, CC, and BCC are taken
# from ZCS.constants. It is unlikely that they will change, but that's where they're defined.

<template id='CollapsedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr collapsed'>
		 	<div class='zcs-msgHdr-person' style='{imageStyle}'></div>
			<tpl if='addrs.FROM'>
			<div class='zcs-msgHdr-fromBubble'>
				<span class='vm-area-bubble zcs-contact-bubble' id='{id}'>{from}</span>
			</div>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-msgHdr-fragment'>{[Ext.String.htmlEncode(values.fragment)]}</div>
		</div>
	</tpl>
</template>

<template id='ExpandedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr expanded'>
		 	<div class='zcs-msgHdr-person' style='{imageStyle}'></div>
			<tpl if='addrs.FROM'>
				<div class='zcs-msgHdr-fromBubble'>
					<span class='vm-area-bubble  zcs-contact-bubble' id='{id}'>{from}</span>
				</div>
			</tpl>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<tpl if='recipients'>
			<div class='zcs-msgHdr-to'>
				<span>{[ZtMsg.to]}</span>
				<span>{recipients}</span>
			</div>
			</tpl>
			<div class='zcs-msgHdr-link'>{[ZtMsg.details]}</div>
			<a class='x-button-normal x-button x-iconalign-center x-layout-box-item x-stretched zcs-flat zcs-msgHdr-menuButton' onClick='return false;'>
				<span class='zcs-msgHeader-menuButton-span x-button-icon arrow_down x-icon-mask'></span>
			</a>
		</div>
		<tpl if='tags && tags.length'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-field'>
				<tpl for='tags'>
					<span class='vm-area-bubble zcs-tag-bubble' id='{id}'>
						<div class="zcs-tag-small zcs-tag-{color}" tagName="{name}" <tpl if='rgb'>style='background-color: {rgb};'</tpl>>
						</div>
						{displayName}
					</span>
				</tpl>
				</div>
			</div>
		</tpl>
	</tpl>
</template>

# TODO: Put OBO display into zcs-msgHdr-from element

<template id='DetailedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr detailed'>
		 	<div class='zcs-msgHdr-person' style='{imageStyle}'></div>
			<tpl if='addrs.FROM'>
				<div class='zcs-msgHdr-fromBubble'>
					<span class='vm-area-bubble  zcs-contact-bubble' id='{id}'>{from}</span>
				</div>
				<tpl if='addrs.FROM[0].address'>
					<tpl for='addrs.FROM'>
						<div class='zcs-msgHdr-from'>{[ZtMsg.from]} {address}</div>
					</tpl>
				</tpl>
			</tpl>
			<div class='zcs-msgHdr-date'>{fullDateStr}</div>
			<div class='zcs-msgHdr-link'>{[ZtMsg.hide]}</div>
			<a class='x-button-normal x-button x-iconalign-center x-layout-box-item x-stretched zcs-flat zcs-msgHdr-menuButton' onClick='return false;'>
				<span class='x-button-icon arrow_down x-icon-mask zcs-msgHeader-menuButton-span'></span>
			</a>
		</div>
		<tpl if='addrs.TO'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-label'>{[ZtMsg.toHdr]}</div>
				<div class='zcs-msgHdr-field'>
				<tpl for='addrs.TO'>
					<span class='vm-area-bubble  zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
				</div>
			</div>
		</tpl>
		<tpl if='addrs.CC'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-label'>{[ZtMsg.ccHdr]}</div>
				<div class='zcs-msgHdr-field'>
				<tpl for='addrs.CC'>
					<span class='vm-area-bubble zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
				</div>
			</div>
		</tpl>
		<tpl if='tags && tags.length'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-label'>{[ZtMsg.tagsHdr]}</div>
				<div class='zcs-msgHdr-field'>
				<tpl for='tags'>
					<span class='vm-area-bubble zcs-tag-bubble' id='{id}'>
						<div class="zcs-tag-small zcs-tag-{color}" tagName="{name}" <tpl if='rgb'>style='background-color: {rgb};'</tpl>>
						</div>
						{displayName}
					</span>
				</tpl>
				</div>
			</div>
		</tpl>
	</tpl>
</template>

<template id='ContactListItem'>
	<div class='zcs-contactListItem'>
		<div class='zcs-contactList-person' <tpl if='imageUrl'>style='background-image:url({imageUrl})'</tpl>></div>
		<div class='zcs-contactList-text'>
			<div class='zcs-contactList-name'>{lastName}<tpl if='lastName && firstName'>, </tpl>{firstName}</div>
			<tpl if='jobTitle || company'>
				<div class='zcs-contactList-title'>{jobTitle}<tpl if='jobTitle && company'>, </tpl>{company}</div>
			</tpl>
		</div>
	</div>
</template>

<template id='Contact'>
	<tpl>
		<div class='zcs-contactview-header'>
			<div class='zcs-contactview-image' style='{imageStyle}'></div>
			<div class='zcs-contactview-personalInfo'>
				<span name="contactname">{lastName}<tpl if='lastName && firstName'>, </tpl>{firstName}</span>
				<tpl if='jobTitle'><span>{jobTitle}</span></tpl>
				<tpl if='company'><span>{company}</span></tpl>
			</div>
		</div>
		<div class='zcs-contactview-fieldSets'>
			<tpl if='emailFields'>
			<div class='zcs-contactview-fieldSet'>
				<div class='zcs-contactview-label'>{[ZtMsg.email]}</div>
				<div class='zcs-contactview-fields'>
					<tpl for='emailFields'>
						<div class='zcs-contactview-field'>{.}</div>
					</tpl>
				</div>
			</div>
			</tpl>
			<tpl if='mobilePhoneFields || workPhoneFields || otherPhoneFields'>
			<div class='zcs-contactview-fieldSet'>
				<div class='zcs-contactview-label'>{[ZtMsg.phone]}</div>
				<div class='zcs-contactview-fields'>
						<tpl for='mobilePhoneFields'>
							 <div class='zcs-contactview-field'>{.}</div>
							 <div class='zcs-contactview-subLabel'>{[ZtMsg.mobile]}</div>
						</tpl>
						<tpl for='workPhoneFields'>
							 <div class='zcs-contactview-field'>{.}</div>
							 <div class='zcs-contactview-subLabel'>{[ZtMsg.work]}</div>
						</tpl>
						<tpl for='otherPhoneFields'>
							 <div class='zcs-contactview-field'>{.}</div>
							 <div class='zcs-contactview-subLabel'>{[ZtMsg.other]}</div>
						</tpl>
				</div>
			</div>
			</tpl>
			<tpl if='isHomeAddressExists || isWorkAddressExists || isOtherAddressExists'>
			<div class='zcs-contactview-fieldSet'>
				<div class='zcs-contactview-label'>{[ZtMsg.address]}</div>
				<div class='zcs-contactview-fields'>
					<tpl if='isHomeAddressExists'>
					<div class='zcs-contactview-field'>
						<tpl for='homeStreetFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='homeCityFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
					    <tpl for='homeStateFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='homePostalCodeFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='homeCountryFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
					</div>
					<div class='zcs-contactview-subLabel'>{[ZtMsg.home]}</div>
					</tpl>
					<tpl if='isWorkAddressExists'>
					<div class='zcs-contactview-field'>
						<tpl for='workStreetFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='workCityFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='workStateFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='workPostalCodeFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='workCountryFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
					</div>
					<div class='zcs-contactview-subLabel'>{[ZtMsg.work]}</div>
					</tpl>
					<tpl if='isOtherAddressExists'>
					<div class='zcs-contactview-field'>
						<tpl for='otherStreetFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='otherCityFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='otherStateFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='otherPostalCodeFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
						<tpl for='otherCountryFields'>{% if (xindex > 1) break; %}<span class='zcs-newLine'>{.}</span></tpl>
					</div>
					<div class='zcs-contactview-subLabel'>{[ZtMsg.other]}</div>
					</tpl>
				</div>
			</div>
			</tpl>
			<tpl if='homeUrlFields || workUrlFields || otherUrlFields'>
			<div class='zcs-contactview-fieldSet'>
				<div class='zcs-contactview-label'>{[ZtMsg.url]}</div>
				<div class='zcs-contactview-fields'>
						<tpl for='homeUrlFields'>
							 <div class='zcs-contactview-field'>{.}</div>
							 <div class='zcs-contactview-subLabel'>{[ZtMsg.home]}</div>
						</tpl>
						<tpl for='workUrlFields'>
							 <div class='zcs-contactview-field'>{.}</div>
							 <div class='zcs-contactview-subLabel'>{[ZtMsg.work]}</div>
						</tpl>
						<tpl for='otherUrlFields'>
							 <div class='zcs-contactview-field'>{.}</div>
							 <div class='zcs-contactview-subLabel'>{[ZtMsg.other]}</div>
						</tpl>
				</div>
			</div>
			</tpl>
		</div>
	</tpl>
</template>

#widgets/_assignmentview.scss
<template id='TagAssignmentListItem'>
	<div class="zcs-tag zcs-tag-{color} zcs-tag-large" <tpl if='rgb'>style="background-color: {rgb};"</tpl>></div>{displayName}
</template>

<template id="Invite">
	<tpl>
		<table class='zcs-invite'>
			<tpl if='start==end'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invDateLabel]}</td>
				<td>{start}</td>
			</tr>
			<tpl else>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invStartLabel]}</td>
				<td>{start}</td>
			</tr>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invEndLabel]}</td>
				<td>{end}</td>
			</tr>
			</tpl>
			<tpl if='location'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invLocationLabel]}</td>
				<td>{location}</td>
			</tr>
			</tpl>
			<tpl if='organizer'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invOrganizerLabel]}</td>
				<td>
					<span class='vm-area-bubble zcs-contact-bubble' id='{organizer.id}'>{organizer.displayName}</span>
				</td>
			</tr>
			</tpl>
			<tpl if='sentBy'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invSentByLabel]}</td>
				<td>
					<span class='vm-area-bubble zcs-contact-bubble' id='{sentBy.id}'>{sentBy.displayName}</span>
				</td>
			</tr>
			</tpl>
			<tpl if='attendees'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invAttendeesLabel]}</td>
				<td>
				<tpl for='attendees'>
					<span class='vm-area-bubble zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
				</td>
			</tr>
			</tpl>
			<tpl if='optAttendees'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invOptionalAttendeesLabel]}</td>
				<td>
				<tpl for='attendees'>
					<span class='vm-area-bubble zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
				</td>
			</tr>
			</tpl>
			<tpl if='myResponse'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invStatusLabel]}</td>
				<td>{myResponse}</td>
			</tr>
			</tpl>
			<tr class='zcs-invite-buttons'>
				<td class='zcs-invite-label'>{[ZtMsg.invRespondLabel]}</td>
				<td>
					<span class='zcs-invite-button zcs-invite-accept' id='{acceptButtonId}'>{[ZtMsg.accept]}</span>
					<span class='zcs-invite-button zcs-invite-tentative' id='{tentativeButtonId}'>{[ZtMsg.tentative]}</span>
					<span class='zcs-invite-button zcs-invite-decline' id='{declineButtonId}'>{[ZtMsg.decline]}</span>
				</td>
			</tr>
			<tpl if='intendedFor'>
			<tr>
				<td class='zcs-invite-label'>{[ZtMsg.invIntendedFor]}</td>
				<td>
					<span class='vm-area-bubble zcs-contact-bubble'>{intendedFor}</span>
				</td>
			</tr>
			</tpl>
		</table>
		<div>{notes}</div>
	</tpl>
</template>

<template id='ConvListSwipeToDelete'>
	<tpl>
		<div class='zcs-swipe-conv-view' style='width:{width}px;height:{height}px;'>
			<div class='zcs-swipe-delete x-button x-button-delete'>{[ZtMsg.del]}</div>
		</div>
	</tpl>
</template>

<template id='Toast'>
	<div class="zcs-toast-contents">
		<div class="zcs-toast-status-icon"></div>
		<div class="zcs-toast-message-text">{text}</div>
		<div class="zcs-toast-undo-action">{[ZtMsg.undo]}</div>
	</div>
</template>

# show a single attachment
<template id='Attachment'>
	<span class='vm-area-bubble zcs-attachment-bubble' id="{id}"><div class='{icon}'></div>{label} <span>({size})</span></span>
</template>

<template id='QuotedLink'>
	<div class='zcs-quoted-link'>
	<tpl if='show'>
		{[ZtMsg.showQuotedText]}
	<tpl else>
		{[ZtMsg.hideQuotedText]}
	</tpl>
	</div>
</template>

<template id='Truncated'>
	<div class='zcs-truncated-message'><span>{[ZtMsg.messageTruncated]}</span> <span class='zcs-truncated-message-link'>{[ZtMsg.messageTruncatedLink]}</span></div>
</template>

<template id='OriginalAttachments'>
	<div class='zcs-link'>{[ZtMsg.addOriginalAttachments]}</div>
</template>

<template id='Folder'>
	<tpl if='unreadCount'><b></tpl>{name}<tpl if='unreadCount'> ({unreadCount})</b></tpl>
</template>
