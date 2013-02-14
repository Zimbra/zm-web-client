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
	<div style='display:inline-block; width=20'>
		<img src='/t/resources/icons/<tpl if='isUnread'>unread.png<tpl else>read.png</tpl>' />
	</div>
	<tpl if='isUnread'>
		<span style='font-weight:bold'>{senders}</span>
	<tpl else>
		<span>{senders}</span>
	</tpl>
	<span class='zcs-mail-date'>{dateStr}</span>
	<div>{subject:ellipsis(35, true)}
	<tpl if='numMsgs &gt; 1'>({numMsgs})</tpl></div>
	<div class='zcs-fragment'>{fragment:ellipsis(80, true)}</div>
</template>

<template id='MsgHeader'>
	<tpl>
		<tpl if='addrs.from'>
			<div>From: 
				<tpl for='addrs.from'>
					<span class='vm-area-bubble' address='{address}'>{displayName}</span>
				</tpl>
				<span class='zcs-mail-date'>{dateStr}</span>
			</div>
		</tpl>
		<div class='zcs-fragment'>{fragment}</div>
	</tpl>
</template>

<template id='ExpandedMsgHeader'>
	<tpl>
		<tpl if='addrs.from'>
			<div>From: 
				<tpl for='addrs.from'>
					<span address='{address}'>{displayName}</span>
				</tpl>
				<span class='zcs-mail-date'>{dateStr}</span>
			</div>
		</tpl>
		<tpl if='addrs.to'>
			<div>To: 
				<tpl for='addrs.to'>
					<span class='vm-area-bubble' address='{address}'>{displayName}</span>
				</tpl>
			</div>
		</tpl>
		<tpl if='addrs.cc'>
			<div>Cc:
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
