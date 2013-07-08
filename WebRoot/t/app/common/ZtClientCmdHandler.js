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
 * This class runs client commands, which are searches that begin with '$cmd:'.
 * The following commands are supported:
 *
 * 		$set:poll				send a poll (get notifications)
 * 		$set:refresh			force immediate return of a refresh block
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtClientCmdHandler', {

	singleton: true,

	/**
	 * Handles a client command
	 * @param {string}      command     the command string, minus the prefatory '$cmd:'
	 * @param {ZtSoapProxy} server      server that can be used if a SOAP request is to be made
	 */
	handle: function(command, server) {

		var me = this;

		command = command.trim();
		if (!command) {
			return;
		}

		var parts = command.split(' '),
			action = parts[0],
			args = [server].concat(parts.slice(1)),
			func = me['handle_' + action];

		if (func) {
			return func.apply(me, args);
		}
		else {
            //<debug>
			Ext.Logger.warn('Unknown client command: ' + action);
            //</debug>
		}
	},

	/**
	 * @private
	 */
	handle_poll: function(server) {
		ZCS.app.getMainController().sendPoll();
	},

	/**
	 * @private
	 */
	handle_refresh: function(server) {
		ZCS.session.setSessionId(null);
		this.handle_poll(server);
	},

	/**
	 * @private
	 */
	handle_version: function(server) {
		Ext.Msg.alert(ZtMsg.version, ZCS.session.getVersion());
	}
});

