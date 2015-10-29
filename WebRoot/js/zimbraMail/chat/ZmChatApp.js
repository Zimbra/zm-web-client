/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmChatApp = function(container) {
    ZmApp.call(this, ZmApp.CHAT, container);
};

ZmChatApp.prototype = new ZmApp;
ZmChatApp.prototype.constructor = ZmChatApp;

ZmChatApp.prototype.toString = function() {    return "ZmChatApp"; };

ZmChatApp.prototype.isChatEnabled = true;

ZmApp.CHAT = ZmId.APP_CHAT;
ZmApp.CLASS[ZmApp.CHAT] = "ZmChatApp";

ZmChatApp.prototype._defineAPI =
function() {
    // TODO
    AjxDispatcher.registerMethod("GetRoster", "ConverseJS", new AjxCallback(this, this.getRoster));
};

ZmChatApp.prototype.getRoster =
function() {
    // TODO - Just a stub.
    return this._roster;
};

ZmChatApp.CONVERSE_PATH = "/js/ajax/3rdparty/converse";

ZmChatApp.prototype.login =
function() {
    // Stub for login
};

ZmChatApp.prototype._init = function() {
    if (appCtxt.get(ZmSetting.CHAT_FEATURE_ENABLED) && appCtxt.get(ZmSetting.CHAT_ENABLED)) {
        var jsonObj = {GetBOSHSessionRequest:{_jsns:"urn:zimbraMail"}};
        //chain UI initialization to SOAP response via a callback
        var callback = new AjxCallback(this, this.initChatUI);
        //Call prebind
        appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, errorCallback:callback, callback:callback});
    }
};

ZmChatApp.prototype.initChatUI = function(response) {
    //TODO - find a better way to append it to z_shell
    var newDiv = document.getElementById("z_shell").appendChild(document.createElement('div'));
    newDiv.style.display = "block";
    newDiv.style.zIndex = 9000;
    newDiv.id = "conversejs";
    appCtxt.getAppViewMgr().fitAll();

    var resp = response.getResponse();
    var jid = resp.GetBOSHSessionResponse.XMPPSession.jid;
    var rid = resp.GetBOSHSessionResponse.XMPPSession.rid;
    var sid = resp.GetBOSHSessionResponse.XMPPSession.sid;
    var url = resp.GetBOSHSessionResponse.XMPPSession.url;

    var self = this;

    converse.plugins.add('zmChatPlugin', function(converse){
        self._extendConverseViews(converse);
        self._registerGlobals();
    });

    converse.initialize({
        auto_list_rooms:false,
        auto_subscribe:false,
        hide_muc_server:false,
		allow_otr: false,
        i18n:locales.en,
        keepalive:true,
        bosh_service_url:url,
        prebind:true,
        show_controlbox_by_default:true,
        roster_groups:true,
        play_sounds:appCtxt.get(ZmSetting.CHAT_PLAY_SOUND),
        sid: sid,
        jid:jid,
        rid:rid
    });
};

ZmChatApp.prototype._extendConverseViews = 
function(converse) {
    this._extendXMPPStatusView(converse, converse.XMPPStatusView);
    this._extendRosterContactView(converse, converse.RosterContactView);
}

ZmChatApp.prototype._extendXMPPStatusView = 
function (converse, xmppStatusView){
    var __ = $.proxy(utils.__, converse);
    
    window.converse.plugins.extend(xmppStatusView,{
        el: "div#controlbox-tabs",  // ZCS - modified template, replaced ul/li tree with div based layout
        events: {
            "click span.icon-plus": "toggleContactForm",
            "click span.icon-search": "toggleSearchForm"
        },
        initialize: function () {
            this._super.initialize.apply(this);
            this.$tabs = this.$el;
        },
        render: function(){
            var chat_status = this.model.get('status') || 'offline';

            var LABEL_ONLINE = __('Online'),
                LABEL_BUSY = __('Busy'),
                LABEL_AWAY = __('Away'),
                LABEL_OFFLINE = __('Offline');                

            // ZCS - contacts tab renders the UI for status drop down
            this.$tabs.append(converse.templates.contacts_tab({
                label_online: LABEL_ONLINE,
                label_busy: LABEL_BUSY,
                label_away: LABEL_AWAY,
                label_offline: LABEL_OFFLINE                    
            }));            

            this._super.render.apply(this);
        },
        setStatus: function (ev) {
            ev.preventDefault();
            var $el = $(ev.target),
                value = $el.attr('data-value');
            if (value === 'logout') {
                this.$el.find(".dropdown dd ul").hide();
                converse.logOut();
            } else {
                this.model.setStatus(value);
                // Bug fix: Reset the status message whenever status is toggled from drop down
                this.model.setStatusMessage('');
                this.$el.find(".dropdown dd ul").hide();
            }
        },
        getPrettyStatus: function (stat) {
            var pretty_status;
            if (stat === 'chat') {
                pretty_status = __('online');
            } else if (stat === 'dnd') {
                pretty_status = __('Busy');
            } else if (stat === 'xa') {
                pretty_status = __('Away for long');
            } else if (stat === 'away') {
                pretty_status = __('Away');
            } else {
                // Bug fix - Error: No translation key found.
                // ZCS - Make first character upper case                                        
                pretty_status = stat && (__(stat).charAt(0).toUpperCase() + __(stat).slice(1)) || __('online');
            }
            return pretty_status;
        },
        toggleContactForm : function(ev) {
            ev.preventDefault();

            var plusIcon = $('.icon-plus');

            if (plusIcon.attr("disabled") == "disabled") {
                return;
            }

            var addContactPanel = $('.add-contact-flyout'),
                controlboxPane = $('.controlbox-panes'),
                searchContactPanel = $('.search-contact-flyout'),
                emailField = addContactPanel.find('#email'),
                displayField = addContactPanel.find('#display'),
                button = addContactPanel.find('button'),
                formHeading = $('.flyout-heading').children().first();

            if (button.hasClass('renameContact')) {
                // TODO: Need to look for translation keys
                button.html(ZmMsg.chatAddContactButton);
                formHeading.html(ZmMsg.chatAddContactFormHeading);
                emailField.removeAttr('disabled');
            }

            controlboxPane.hide();
            searchContactPanel.hide();
            addContactPanel.show();
            plusIcon.attr("disabled","disabled");
            plusIcon.addClass('disabled');
            // ZCS - Fix for Bug: 100561
            emailField[0].value = "";
            displayField[0].value = "";
            emailField[0].focus();
        },
        /**
         * Show/hide search contact form.
         * 
         * @param   {object}      ev        the event object
         */
        toggleSearchForm: function(ev) {
            ev.preventDefault();

            var searchIcon = $('.icon-search');

            if (searchIcon.attr("disabled") === "disabled") {
                return;
            }

            var addContactPanel = $('.add-contact-flyout'),
                controlboxPane = $('.controlbox-panes'),
                searchContactPanel = $('.search-contact-flyout'),
                searchField = searchContactPanel.find('#search');

            controlboxPane.hide();
            addContactPanel.hide();
            searchContactPanel.show();

            searchIcon.attr("disabled","disabled");
            searchIcon.addClass('disabled');

            searchField[0].focus();                
        }

    });
};

ZmChatApp.prototype._extendRosterContactView =
function(converse, rosterContactView) {
    window.converse.plugins.extend(rosterContactView, {
        events: {
            "click .alter-menu-xmpp-contact": "showAlterContactMenu",
            "click li.removeContact": "removeContact",
            "click li.renameContact": "toggleRenameForm"
        },

        showAlterContactMenu: function(ev) {
            ev.preventDefault();

            var alterContactMenu = $(ev.target.nextElementSibling);
            var openedCustomMenu = $('.custom-menu.opened');

            if (openedCustomMenu.length > 0) {
                openedCustomMenu.removeClass('opened');
                openedCustomMenu.hide();

                if (openedCustomMenu.attr('data-jid') === alterContactMenu.attr('data-jid')) {
                    return;
                }
            }

            var rosterBox = $('.box-flyout');
            var contactToAlter = $(ev.target.previousElementSibling);
            // Positioning alter contact menu -> (buddylist window width - alter contact menu) - (clicked user DD element - buddylist's left)
            var pageX = (rosterBox.width() - alterContactMenu.width()) - ((contactToAlter.offset().left - rosterBox.offset().left));

            // Show the rename/delete contact menu
            alterContactMenu.addClass('opened');
            alterContactMenu.css({
                left: pageX + "px"
            });

            alterContactMenu.show();
        },

        toggleRenameForm: function(ev) {
            var addContactPanel = $('.add-contact-flyout'),
                controlboxPane = $('.controlbox-panes'),
                searchContactPanel = $('.search-contact-flyout'),
                emailField = addContactPanel.find('#email'),
                displayField = addContactPanel.find('#display'),
                button = addContactPanel.find('button'),
                jid = $(ev.target.parentNode).attr('data-jid') || $(ev.target.parentElement).attr('data-jid'),
                formHeading = $('.flyout-heading').children().first();

            button.removeClass().addClass('renameContact');
            button.html(ZmMsg.chatRenameContactButton);
            formHeading.html(ZmMsg.chatRenameContactFormHeading);

            controlboxPane.hide();
            addContactPanel.show();
            emailField[0].value = jid;
            emailField.attr('disabled', 'disabled');
            emailField.removeClass();
            displayField[0].value = "";
            displayField[0].focus();
        }
    });
};

ZmChatApp.prototype._registerGlobals =
function() {
    // Global click events that we intend to override or add new interactions
    $(document).on('click', function (e) {

        // Close custom menu to alter buddy list contacts if clicked outside it's trigger scope
        if ($(e.target).closest(".alter-menu-xmpp-contact").length === 0) {
            var alterContactMenu = $('.custom-menu').filter('.opened');
            alterContactMenu.removeClass('opened');
            alterContactMenu.hide();
            e.stopPropagation();
        }

        // Close user status menu if clicked outside it's trigger scope
        if ($(e.target).closest("a.choose-xmpp-status").length === 0) {
            var xmppStatusMenu = $('ul.xmpp-status-menu');
            xmppStatusMenu.hide();
            e.stopPropagation();
        }
    });
};

ZmChatApp.prototype.launch =
function(params, callback) {
    this._setLaunchTime(this.toString(), new Date());
    var loadCallback = this._handleLoadLaunch.bind(this, callback);
    AjxDispatcher.require(["ConverseJS"], true, loadCallback, null, true);
};

ZmChatApp.prototype._handleLoadLaunch =
function(params, callback) {
    this._setLoadedTime(this.toString(), new Date());
    if (callback) {
        callback.run();
    }
    this._init();
};

ZmChatApp.prototype.setPlaySoundSetting =
function(value) {
    if (appCtxt.get(ZmSetting.CHAT_FEATURE_ENABLED) && appCtxt.get(ZmSetting.CHAT_ENABLED)) {
        converse.settings.set('play_sounds', value);
    }
};