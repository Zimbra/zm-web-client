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
 * This controller manages the app tabs, and is responsible for the initial construction
 * of the tab panel. Stuff that is not specific to a particular app can be found here.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.ZtMainController', {

	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'Ext.MessageBox'
	],

	config: {

		refs: {
			tabBar: 'tabbar',
			mainView: 'ztmain'
		},

		control: {
			tabBar: {
				showMenu: 'doShowMenu'
			},
			mainView: {
				activeitemchange: function (tabPanel, tab, oldTab) {
				    ZCS.app.fireEvent('applicationSwitch', tab.config.app);
				    ZCS.session.setActiveApp(tab.config.app);
				}
			}
		},

		// settings menu
		menuConfigs: {
			settings: [
				{ label: ZtMsg.logout, action: ZCS.constant.OP_LOGOUT, listener: 'doLogout' }
			]
		}
	},

	launch: function() {

		// Initialize the main view
		Ext.Viewport.add(Ext.create('ZCS.view.ZtMain'));
		ZCS.app.on('authExpired', this.authExpired, this);
	},

	/**
	 * Logs off the application
	 */
	doLogout: function() {
        var qs = location.search;
        var pairs = [];
        var j = 0;
        var logoutUrl;
        if (qs) {
            var qsArgs = qs.split("&");
            for (var i = 0; i < qsArgs.length; i++) {
                var f = qsArgs[i].split("=");
                if (f[0] != 'loginOp') {
                    pairs[j++] = [f[0], f[1]].join("=");
                }
            }
            pairs[j] = ["loginOp", "logout"].join("=");
            logoutUrl = "/" + pairs.join("&");
        }  else {
            logoutUrl = "/?loginOp=logout";
        }
		window.location.href = logoutUrl;
	},

	/**
	 * Cancels a pending poll if there is one, then sets up to poll after an interval.
	 */
	schedulePoll: function() {

		if (this.pollId) {
			clearTimeout(this.pollId);
		}
        //<debug>
		Ext.Logger.poll('scheduling poll');
        //</debug>
		this.pollId = Ext.defer(this.sendPoll, ZCS.constant.POLL_INTERVAL * 1000, this);
	},

	/**
	 * Sends a poll to the server to fetch any pending notifications. Borrows the conv store's
	 * proxy to send the request.
	 */
	sendPoll: function() {

        //<debug>
		Ext.Logger.poll('sending poll');
        //</debug>
		var server = Ext.getStore('ZtConvStore').getProxy(),
			options = {
				url: ZCS.constant.SERVICE_URL_BASE + 'NoOpRequest',
				jsonData: server.getWriter().getSoapEnvelope(null, null, 'NoOp')
			};

		server.sendSoapRequest(options);
	},

	/**
	 * Handles session expiration by putting up an alert box, then logging the user out.
	 */
	authExpired: function() {

		if (this.pollId) {
			clearTimeout(this.pollId);
		}

		Ext.Msg.alert(ZtMsg.authExpiredTitle, ZtMsg.authExpiredText, function() {
			this.doLogout();
		}, this);
	}
});
