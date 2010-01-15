/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an IM service.
 * @constructor
 * @class  ZmImService
 * This class is a base class for IM services. The app should create only one instance
 * of a service, and after it is created the single instance should be accessed via
 * ZmImApp.INSTANCE.getService().
 *
 */
ZmImService = function(roster) {
	if (arguments.length == 0) { return; }

	this._roster = roster;
};

/**
 * Returns true if the service is logged in. (To log in / out use the methods on ZmImServiceController.)
 */
ZmImService.prototype.isLoggedIn =
function() {
	alert('Not implemented');
};

/**
 * Returns the im address for the logged in user.
 */
ZmImService.prototype.getMyAddress =
function() {
	alert('Not implemented');
};

/**
 * Converts the user-supplied address and a gateway type into an
 * address the server understands. 
 */
ZmImService.prototype.makeServerAddress =
function(addr, type) {
	alert('Not implemented');
};

/**
 * Asyncronously fetches the list of gateways.
 *
 * @param callback		[AjxCallback]		Callback to run when list of gateways is known
 * @param params		[hash]				ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.getGateways =
function(callback, params) {
	alert('Not implemented');
};

/**
 * Reconnects to the gateway.
 *
 * @param gw		[ZmImGateway]		Gateway
 */
ZmImService.prototype.reconnectGateway =
function(gw) {
	alert('Not implemented');
};

/**
 * Unregisters the gateway the gateway.
 *
 * @param service		[String]		The name of the service
 * @param batchCmd		[ZmBatchCmd]	Optional batch command
 */
ZmImService.prototype.unregisterGateway =
function(service, batchCmd) {
	alert('Not implemented');
};

/**
 * Registers the gateway the gateway.
 *
 * @param service		[String]		The name of the service
 * @param batchCmd		[ZmBatchCmd]	Optional batch command
 */
ZmImService.prototype.registerGateway =
function(service, screenName, password, batchCmd) {
	alert('Not implemented');
};

/**
 * Asyncronously fetches the roster (buddy list).
 *
 * @param callback		[AjxCallback]		Callback to run when roster is known
 * @param params		[hash]				ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.getRoster =
function(callback, params) {
	alert('Not implemented');
};

/**
 * Initializes the presence after login.
 *
 * @param presence			[hash]			hash of params:
 *        show				[String] 		The show string. Constants defined in ZmRosterPresence
 *        customStatusMsg	[hash]			Optional custom status message
 */
ZmImService.prototype.initializePresence =
function(presence) {
	alert('Not implemented');
};

/**
 * Sets the presence.
 *
 * @param show				[String] 		The show string. Constants defined in ZmRosterPresence
 * @param customStatusMsg	[hash]			Optional custom status message
 * @param batchCmd			[ZmBatchCmd]	Optional batch command
 */
ZmImService.prototype.setPresence =
function(show, priority, customStatusMsg, batchCommand) {
	alert('Not implemented');
};

/**
 * Sets the idle state.
 *
 * @param idle				[Boolean] 		True if user is idle.
 * @param idleTime			[Integer]		Optional idle time in minutes
 */
ZmImService.prototype.setIdle =
function(idle, idleTime) {
	alert('Not implemented');
};

/**
 * Creates a roster item (buddy)
 *
 * @param addr				[String] 		IM address
 * @param name				[String]		Screen name
 * @param groups			[String]		Comma-separated list of groups the buddy belongs to
 * @param params			[hash]			ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.createRosterItem =
function(addr, name, groups, params) {
	alert('Not implemented');
};

/**
 * Deletes a roster item (buddy)
 *
 * @param rosterItem		[ZmRosterItem] 	The roster item
 * @param params			[hash]			ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	alert('Not implemented');
};

/**
 * Accepts or declines a buddy invitation
 *
 * @param accept		[Boolean]	 	True to accept the invitation
 * @param add			[Boolean]		True to also add the sender to our buddy list
 * @param addr			[String]		The address of the invitation sender
 */
ZmImService.prototype.sendSubscribeAuthorization =
function(accept, add, addr) {
};

/**
 * Sends a message
 *
 * @param chat		[ZmChat]	 	The chat
 * @param text		[String]		The plain text message
 * @param html		[String]		The optional html message
 * @param typing	[Boolean]		True to just send typing notification
 * @param params	[hash]			ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	alert('Not implemented');
};

/**
 * Ends a chat
 *
 * @param chat		[ZmChat]	 	The chat
 * @param params	[hash]			ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.closeChat =
function(chat, params) {
	alert('Not implemented');
};

/**
 * Gets the list of conference services.
 *
 * @param callback	[AjxCallback]			Callback
 * @param params	[hash]					ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.getConferenceServices =
function(callback, params) {
	alert('Not implemented');
};

/**
 * Gets the list of conference rooms.
 *
 * @param service	[ZmConferenceService]	Service
 * @param callback	[AjxCallback]			Callback
 * @param params	[hash]					ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.getConferenceRooms =
function(service, callback, params) {
	alert('Not implemented');
};

/**
 * Creates a conference room.
 *
 * @param service	[ZmConferenceService]	Service
 * @param name		[String]				Name of the room
 * @param callback	[AjxCallback]			Callback
 * @param params	[hash]					ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.createConferenceRoom =
function(service, name, callback, params) {
	alert('Not implemented');
};

/**
 * Configure a conference room.
 *
 * @param room		[ZmConferenceRoom]		Room
 * @param config	[Hash]					Config options. The following are supported
 *					 hidden           boolean         room is hidden from RoomList
 *					 nothidden        boolean         opposite of hidden
 *					 membersonly      boolean         only members may join
 *					 noanonymous      boolean         if TRUE, then users are not anonymous
 *					 semianonymous    boolean         no idea what this means
 *					 passwordprotect  boolean         password required to join
 *					 persistent       boolean         room not deleted if server restarts
 *					 temporary        boolean         opposite of temporary
 *					 moderated        boolean
 *					 unmoderated      boolean
 *					 numoccupants     integer         number of people currently in the room
 *					 password         string          the password for the room
 *					 maxusers         integer         max # users allowed
 *					 name             string          the XMPP shortname of the room
 *					 longname         string          natural language name of room
 *					 owners           MULTI-string    list of room owners (can change config)
 *
 * @param callback	[AjxCallback]			Callback
 * @param params	[hash]					ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.configureConferenceRoom =
function(room, config, callback, params) {
	alert('Not implemented');
};

/**
 * Join a conference room.
 *
 * @param room		[ZmConferenceRoom]		Room
 * @param password 	[String]				Optional password for entering room
 * @param callback	[AjxCallback]			Callback
 * @param params	[hash]					ZmRequestMgr#sendRequest params
 *
 * The response object may contain any of these error codes:
 *				 PasswordRequired - couldn't enter room password required
 *				 Banned - room owner has banned you from the room
 *				 NoSuchRoom -
 *				 NotAllowed - Room doesn't exist, and you're not allowed to create a new one
 *				 MustUseReservedRoomnick -
 *				 NotAMember - Room is invite-only, and you aren't a member
 *				 NicknameConflict - Someone else is already using your nickname
 *				 MaxUsers - Room has reached capacity
 *				 Unknown
 *
 *
 */
ZmImService.prototype.joinConferenceRoom =
function(room, password, callback, params) {
	alert('Not implemented');
};

/**
 * Handles a notification from the request manager
 *
 * @param chat		[ZmChat]	 	The chat
 * @param params	[hash]			ZmRequestMgr#sendRequest params
 */
ZmImService.prototype.handleNotification =
function(im) {
	alert('Not implemented');
};

/**
 * Starts a period of time where presence alerts are not shown
 */
ZmImService.prototype.startIgnoreNotify =
function() {
	this.__avoidNotifyTimeout = new Date().getTime();

};

/**
 * Returns true if presence alerts should be shown right now.
 */
ZmImService.prototype.getShowNotify =
function() {
	return !this.__avoidNotifyTimeout ||
			(new Date().getTime() - this.__avoidNotifyTimeout > ZmRoster.NOTIFICATION_FOO_TIMEOUT);
};


