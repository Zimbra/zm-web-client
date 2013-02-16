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
			<img src='/t/resources/icons/invitation<tpl if='isUnread'>_unread</tpl>.png' />
		</div>
		<tpl else>
		<div class='zcs-mail-readState'>
			<img src='/t/resources/icons/<tpl if='isUnread'>un</tpl>read.png' />
		</div>
		</tpl>
		<div class='zcs-mail-senders<tpl if='isUnread'>-unread</tpl>'>
			{senders}
			<tpl if='numMsgs &gt; 1'><span class='zcs-numMsgs'>{numMsgs}</span></tpl>
		</div>
		<div class='zcs-mail-date'>{dateStr}</div>
		<tpl if='hasAttachment'><div class='zcs-mail-attachment'>
			<img src='/t/resources/icons/attachment.png' /></div></tpl>
		<div class='zcs-mail-subject<tpl if='isUnread'>-unread</tpl>'>{subject}</div>
		<tpl if='isFlagged'><div class='zcs-mail-flag'>
			<img src='/t/resources/icons/flagged.png' /></div></tpl>
		<div class='zcs-mail-fragment'>{fragment}</div>
	</div>
</template>

# TODO: remove last comma after To/Cc list.
<template id='MsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr'>
			<div class='zcs-msgHdr-person'>
				<img src='/t/resources/icons/person.png' />
			</div> 
			<tpl if='addrs.from'>
				<div class='zcs-msgHdr-fromBubble'>
					<tpl for='addrs.from'>
						<span class='vm-area-bubble' address='{address}'>{displayName}</span>
					</tpl>
				</div>
			</tpl>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-msgHdr-to'>
				<span>to</span>
				<tpl if='addrs.to'>
					<tpl for='addrs.to'>
						<span>{displayName},</span>
					</tpl>
				</tpl>
				<tpl if='addrs.cc'>
					<tpl for='addrs.cc'>
						<span>{displayName},</span>
					</tpl>
				</tpl>
			</div>
			<div class='zcs-msgHdr-link'>Details</div>
		</div>
	</tpl>
</template>

<template id='CollapsedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr'>
			<div class='zcs-msgHdr-person'>
				<img src='/t/resources/icons/person.png' />
			</div>
			<tpl if='addrs.from'>
			<div class='zcs-msgHdr-fromBubble'>
				<span class='vm-area-bubble' address='{address}'>{displayName}</span>
			</div>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-colMsgHdr-fragment'>{fragment}</div>
		</div>
	</tpl>
</template>

# TODO: Put OBO display into zcs-msgHdr-from element

<template id='ExpandedMsgHeader'>
	<tpl>
		<div class='zcs-mail-msgHdr'>
			<div class='zcs-msgHdr-person'>
				<img src='/t/resources/icons/person.png' />
			</div>  
			<tpl if='addrs.from'>
				<div class='zcs-msgHdr-fromBubble'>
					<tpl for='addrs.from'>
						<span class='vm-area-bubble' address='{address}'>{displayName}</span>
					</tpl>
				</div>
				<tpl for='addrs.from'>
					<div class='zcs-msgHdr-from'>from {address}</div>
				</tpl>
			</tpl>
			<div class='zcs-msgHdr-date'>{dateStr}</div>
			<div class='zcs-msgHdr-link'>Hide</div>
		</div>
		<tpl if='addrs.to'>
			<div class='zcs-mail-expMsgHdr'>
				<div class='zcs-msgHdr-label'>To</div>
				<tpl for='addrs.to'>
					<span class='vm-area-bubble' address='{address}'>{displayName}</span>
				</tpl>
			</div>
		</tpl>
		<tpl if='addrs.cc'>
			<div class='zcs-mail-expMsgHdr'>
				<div class='zcs-msgHdr-label'>Cc</div>
				<tpl for='addrs.cc'>
					<span class='vm-area-bubble' address='{address}'>{displayName}</span>
				</tpl>
			</div>
		</tpl>
	</tpl>
</template>

<template id='MsgBody'>
	<tpl>
		<div>{content}</div>
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
