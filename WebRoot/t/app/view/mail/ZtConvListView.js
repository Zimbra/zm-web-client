var itemTpl =
	"<div style='display:inline-block; width=20'>" +
	"<img src='/t/resources/icons/" +
	"<tpl if='isUnread'>unread.png<tpl else>read.png</tpl>' /></div>" +
	"<tpl if='isUnread'>" +
	"<span style='font-weight:bold'>{senders}</span>" +
	"<tpl else>" +
	"<span>{senders}</span>" +
	"</tpl>" +
	"<span class='zcs-mail-date'>{dateStr}</span>" +
	"<div>{subject:ellipsis(35, true)} " +
	"<tpl if='numMsgs &gt; 1'>({numMsgs})</tpl></div>" +
	"<div class='zcs-fragment'>{fragment:ellipsis(80, true)}</div>";

Ext.define('ZCS.view.mail.ZtConvListView', {

	extend: 'ZCS.view.ZtListView',

	xtype: 'convlistview',

	config: {
		loadingText: "Loading conversations ...",
		emptyText: "<div class=\"notes-list-empty-text\">No conversations found.</div>",
		itemTpl: itemTpl
	}
});
