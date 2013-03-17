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
		<div class='zcs-mail-subject<tpl if='isUnread'>-unread</tpl>'>{subject}</div>
		<tpl if='numMsgs &gt; 1'><span class='zcs-numMsgs'>{numMsgs}</span></tpl>
		<tpl if='isFlagged'><div class='zcs-mail-flag'>
			<img src='/t/resources/images/flagged.png' /></div></tpl>
		<div class='zcs-mail-fragment'>{fragment}</div>
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
				<tpl for='addrs.FROM'>
					<span class='vm-area-bubble zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
			</div>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-msgHdr-fragment'>{fragment}</div>
		</div>
	</tpl>
</template>

<template id='ExpandedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr expanded'>
		 	<div class='zcs-msgHdr-person' style='{imageStyle}'></div>
			<tpl if='addrs.FROM'>
				<div class='zcs-msgHdr-fromBubble'>
					<tpl for='addrs.FROM'>
						<span class='vm-area-bubble  zcs-contact-bubble' id='{id}'>{displayName}</span>
					</tpl>
				</div>
			</tpl>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-msgHdr-to'>
				<span>{[ZtMsg.to]}</span>
				<span>{recipients}</span>
			</div>
			<div class='zcs-msgHdr-link'>{[ZtMsg.details]}</div>
			<div class='zcs-msgHdr-menuButton'></div>
		</div>
	</tpl>
</template>

# TODO: Put OBO display into zcs-msgHdr-from element

<template id='DetailedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr detailed'>
		 	<div class='zcs-msgHdr-person' style='{imageStyle}'></div>
			<tpl if='addrs.FROM'>
				<div class='zcs-msgHdr-fromBubble'>
					<tpl for='addrs.FROM'>
						<span class='vm-area-bubble  zcs-contact-bubble' id='{id}'>{displayName}</span>
					</tpl>
				</div>
				<tpl for='addrs.FROM'>
					<div class='zcs-msgHdr-from'>{[ZtMsg.from]} {address}</div>
				</tpl>
			</tpl>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-msgHdr-link'>{[ZtMsg.hide]}</div>
			<div class='zcs-msgHdr-menuButton'></div>
		</div>
		<tpl if='addrs.TO'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-label'>{[ZtMsg.toHdr]}</div>
				<tpl for='addrs.TO'>
					<span class='vm-area-bubble  zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
			</div>
		</tpl>
		<tpl if='addrs.CC'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-label'>{[ZtMsg.ccHdr]}</div>
				<tpl for='addrs.CC'>
					<span class='vm-area-bubble zcs-contact-bubble' id='{id}'>{displayName}</span>
				</tpl>
			</div>
		</tpl>
		<tpl if='tags'>
			<div class='zcs-mail-dtlMsgHdr'>
				<div class='zcs-msgHdr-label'>{[ZtMsg.tags]}</div>
				<tpl for='tags'>
					<span class='vm-area-bubble zcs-tag-bubble' id='{id}'>
						<div class="zcs-tag-small zcs-tag-{color}" tagName="{name}" <tpl if='rgb'>style='background-color: {rgb};'</tpl>>
						</div>
						{name}
					</span>
				</tpl>
			</div>
		</tpl>
	</tpl>
</template>

<template id='ContactListItem'>
	<span style='font-weight:bold'>{lastName}, {firstName}</span>
</template>

<template id='Contact'>
	<tpl>
		<div>{firstName} {lastName}</div>
	</tpl>
</template>

#widgets/_assignmentview.scss
<template id='TagAssignmentListItem'>
	<div class="zcs-tag zcs-tag-{color} zcs-tag-large" <tpl if='rgb'>style="background-color: {rgb};"</tpl>></div>{name}
</template>

<template id="Invite">
	<tpl>
		<table>
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
		</table>
		<div>{notes}</div>
	</tpl>
</template>

<template id='ConvListSwipeToDelete'>
	<div class="zcs-swipe-conv-view" style="width:{0}px;height:{1}px;">
		<div class="zcs-swipe-delete">Delete</div>
	</div>
</template>

<template id='Toast'>
	<div class="zcs-toast-contents">
		<div class="zcs-toast-status-icon"></div>
		<div class="zcs-toast-message-text">{0}</div>
		<div class="zcs-toast-undo-action">Undo</div>
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
