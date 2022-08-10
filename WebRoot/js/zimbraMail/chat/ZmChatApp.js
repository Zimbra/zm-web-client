/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmChatApp = function(container) {
    ZmApp.call(this, ZmApp.CHAT, container);
};

ZmChatApp.prototype = new ZmApp;
ZmChatApp.prototype.constructor = ZmChatApp;

ZmChatApp.prototype.toString = function() {    return "ZmChatApp"; };

ZmChatApp.prototype.isChatEnabled = true;

ZmChatApp.isServerReachable = false;

ZmApp.CHAT = ZmId.APP_CHAT;
ZmApp.CLASS[ZmApp.CHAT] = "ZmChatApp";

ZmChatApp.OFFLINE = 'offline';
ZmChatApp.BUSY = 'dnd';
ZmChatApp.INACTIVE = 'inactive';
ZmChatApp.ACTIVE = 'active';
ZmChatApp.COMPOSING = 'composing';
ZmChatApp.PAUSED = 'paused';
ZmChatApp.GONE = 'gone';

ZmChatApp.CHAT_EVENTS = {};
ZmChatApp.TIMERS = {};
ZmChatApp.CHAT_POLL_INTERVAL = 30000;

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
        //chain UI initialization to SOAP response via a callback
        var callback = new AjxCallback(this, this.initChatUI);
        //Call prebind
        var soapDoc = AjxSoapDoc.create("GetAccountInfoRequest", "urn:zimbraAccount", null);
        var accBy = soapDoc.set('account', appCtxt.getUsername());
        accBy.setAttribute('by', 'name');
        // TODO - Need to have different handler for errorCallback and it will fix Bug: 100887
        appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode:true, errorCallback:callback, callback:callback});
    }
};

ZmChatApp.prototype._addListeners =
function() {

    if (!ZmChatApp.TIMERS.checkServerStatusTimer) {
        // Poll the XMPP service every 30 seconds by default else it is configurable
        $(window).on("online offline", ZmChatApp.checkServerStatus);

        ZmChatApp.TIMERS.checkServerStatusTimer = setInterval(ZmChatApp.checkServerStatus, ZmChatApp.CHAT_POLL_INTERVAL);
        // Set the counter while attaching the listener, it produces a NaN if not set to 0.
        ZmChatApp.TIMERS.ConnectTriggerCount = 0;
    }

    ZmChatApp.CHAT_EVENTS.bind("ZChatConnect", this._reconnectChat, this);
    ZmChatApp.CHAT_EVENTS.bind("ZChatDisconnect", this._disconnectChat, this);
};

ZmChatApp.prototype._reconnectChat =
function() {
    // This will ensure only one zimbraim request is processes irrespective of coming from auto-reconnect or retry btn.
    if (ZmChatApp.TIMERS.ConnectTriggerCount === 1) {
        this._init();
    }
};

ZmChatApp.prototype._disconnectChat =
function() {
    converse.disconnect();
};

ZmChatApp.prototype.initChatUI = function(response) {

    if (!response || response.isZmCsfeException) {
        return;
    }

    this.widgets = {};
    this._initWidgets();

    var params = {
        id : "conversejs",
        parent : appCtxt.getShell(),
        posStyle : DwtControl.FIXED_STYLE
    };

    var dwtConverse = new DwtComposite(params);
    dwtConverse.setVisible(true);
    dwtConverse.setZIndex(2 * Dwt.Z_SPLASH);

    dwtConverse._setAllowSelection();

    dwtConverse.preventContextMenu = function () {
        return false;
    }

    appCtxt.getShell().addChild(dwtConverse);
    appCtxt.getAppViewMgr().fitAll();

    var resp = response.getResponse();
    var url = resp.GetAccountInfoResponse.boshURL;
    var jid = resp.GetAccountInfoResponse.name;

    var self = this;
    var __;
    var converseObject,
        headerTextGenerator = {
        getOnlineContactsHeaderText: function (onlineContactsCount) {
            var headerText;
            if (onlineContactsCount === 0) {
                headerText = ZmMsg.chatNoContactOnline;
            } else if (onlineContactsCount === 1) {
                headerText = ZmMsg.chatContactOnline;
            } else {
                headerText = AjxMessageFormat.format(ZmMsg.chatMultipleContactsOnline, converseObject.roster.getNumOnlineContacts());
            }
            return headerText;
        },
        getPendingContactsHeaderText: function (contactsCount) {
            var headingText = contactsCount > 1 ? 
                                AjxMessageFormat.format(ZmMsg.chatMultiplePendingContacts, contactsCount) 
                                : ZmMsg.chatPendingContact;
            return headingText;
        },

        getContactRequestsHeaderText: function (contactsCount) {
            var headingText = contactsCount > 1 ? 
                                    AjxMessageFormat.format(ZmMsg.chatMultipleContactsRequest, contactsCount) 
                                    : ZmMsg.chatContactRequest;
            return headingText;
        }
    };

    ZmChatApp.CHAT_EVENTS = {};

    _.extend(ZmChatApp.CHAT_EVENTS, Backbone.Events);

    this._addListeners();

    var contains = function (attr, query) {
        return function (item) {
            if (typeof attr === 'object') {
                var value = false;
                _.each(attr, function (a) {
                    value = value || item.get(a).toLowerCase().indexOf(query.toLowerCase()) !== -1;
                });
                return value;
            } else if (typeof attr === 'string') {
                return item.get(attr).toLowerCase().indexOf(query.toLowerCase()) !== -1;
            } else {
                throw new Error('Wrong attribute type. Must be string or array.');
            }
        };
    };

    converse.plugins.add('zmChatPlugin', {
        initialize: function() {
            self._registerGlobals();
            converseObject = this.converse;
            converseObject.newChats = {};
            __ = $.proxy(utils.__, converseObject);

            if (!ZmChatApp.TIMERS.sendPresenceTimer) {
                ZmChatApp.TIMERS.sendPresenceTimer =
                    setInterval(function() {
                        if (converseObject.connection) {
                            if (converseObject.connection.connected) {
                                converseObject.xmppstatus.sendPresence();
                            }
                        }
                    }, ZmChatApp.CHAT_POLL_INTERVAL);
            }
        },

        overrides: {
            registerGlobalEventHandlers: function() {

                // Tab or window close, page reload.
                $(window).on('unload beforeunload', function() {
                    // Bug: 103451 - Disconnect Chat connection when download attachment file
                    // Logout only when session has ended
                    if (ZmZimbraMail.hasSessionEnded()) {
                        converseObject.logOut();
                    }

                });

                // Signout button clicked
                $('#logOff').click(function() {
                    converseObject.logOut();
                });

                this._super.registerGlobalEventHandlers();
            },

            attemptPreboundSession: function() {
                // Converse tries to restore the session from cached JID/SID. Overriding the function we will always attach user to new session.
                if (this.converse.prebind_url) {
                    this.converse.clearSession();
                    this.converse._tearDown();
                    this.converse.startNewBOSHSession();
                }
            },

            applyHeightResistance: function (height) {
                height = this._super.applyHeightResistance(height);
                //add a minimum height of 10px and max window height for the chat window.
                var winHeight = $(document).height();
                if (height < 10) {
                    height = 10;
                } else if (height > winHeight) {
                    height = winHeight;
                }
                return height;
            },

            ChatBoxView: {
                onChatStatusChanged: function(item) {
                    var chat_status = item.get('chat_status'),
                        fullname = item.get('fullname'),
                        elChatTitle = this.$el.find('.chat-title>span[class^=icon-]'),
                        chatBoxId = item.get('box_id'),
                        chatBox = document.getElementById(chatBoxId), // Not using jquery selector because chatBoxId constitutes of special characters
                        chatTextArea = $(chatBox).find('.chat-textarea'); // Don't want to add unnecessary code for jquery special character escapes or reqex

                    fullname = AjxUtil.isEmpty(fullname) ? item.get('jid'): fullname;
					if (this.$el.is(':visible')) {
                        if (chat_status === ZmChatApp.OFFLINE || chat_status === ZmChatApp.BUSY) {
                            var chat_status_display = (chat_status === ZmChatApp.BUSY) ? ZmMsg.chatStatusBusy : ZmMsg.chatStatusOffline;
                            this.showStatusNotification(AjxMessageFormat.format(ZmMsg.chatMsgDeliveryRestricted, [fullname, chat_status_display]));
                            chatTextArea.prop('disabled', true);
                        } else {
                            this.$el.find('div.chat-event').remove();
                            chatTextArea.prop('disabled', false);
                        }
                    }

                    // Fix for Bug: 100630 - IM broken
                    /* Emit contactStatusChanged only if the chatbox is rendered. Else breaks IM functionality. */
                    if (elChatTitle) {
                        elChatTitle.removeClass().addClass('icon-' + chat_status);
                        converseObject.emit('contactStatusChanged', item.attributes, item.get('chat_status'));
                    }
                },

                onMessageAdded: function (message) {
                    var time = message.get('time'),
                        times = this.model.messages.pluck('time'),
                        previous_message, idx, this_date, prev_date, text, match;

                    // If this message is on a different day than the one received
                    // prior, then indicate it on the chatbox.
                    idx = _.indexOf(times, time)-1;
                    if (idx >= 0) {
                        previous_message = this.model.messages.at(idx);
                        prev_date = moment(previous_message.get('time'));
                        if (prev_date.isBefore(time, 'day')) {
                            this_date = moment(time);
                            this.$el.find('.chat-content').append(converseObject.templates.new_day({
                                isodate: this_date.format("YYYY-MM-DD"),
                                datestring: this_date.format("dddd MMM Do YYYY")
                            }));
                        }
                    }
                    if (!message.get('message')) {
                        if (message.get('chat_state') === ZmChatApp.COMPOSING) {
                            this.showStatusNotification(AjxMessageFormat.format(ZmMsg.chatUserTyping, message.get('fullname')));
                            return;
                        } else if (message.get('chat_state') === ZmChatApp.PAUSED) {
                            //this.showStatusNotification(message.get('fullname')+' '+__('has stopped typing'));
                            return;
                        } else if (_.contains([ZmChatApp.INACTIVE, ZmChatApp.ACTIVE], message.get('chat_state'))) {
                            this.$el.find('.chat-content div.chat-event').remove();
                            return;
                        } else if (message.get('chat_state') === ZmChatApp.GONE) {
                            //this.showStatusNotification(message.get('fullname')+' '+__('has gone away'));
                            return;
                        }
                    } else {
                        this.showMessage(_.clone(message.attributes));
                    }
                    if ((message.get('sender') != 'me') && (converseObject.windowState == 'blur')) {
                        converseObject.incrementMsgCounter();
                    }
                    this.scrollDown();
                    if (!this.model.get('minimized') && !this.$el.is(':visible')) {
                        this.show();
                    }
                },

                insertIntoPage: function () {
                    this.$el.insertBefore(converseObject.minimized_chats.$el);
                },

                show: function (callback) {
                    var contact = converseObject.roster.get(this.model.get('jid'));
                    var chat_status = contact ? contact.get('chat_status') : "online";
                    var fullname = this.model.get('fullname'),
                        chatBoxId = this.model.get('box_id'),
                        chatBox = document.getElementById(chatBoxId), // Not using jquery selector because chatBoxId constitutes of special characters
                        chatTextArea = $(chatBox).find('.chat-textarea'); // Don't want to add unnecessary code for jquery special character escapes or reqex
                    fullname = AjxUtil.isEmpty(fullname) ? item.get('jid'): fullname;
                    //ZCS change - Notify user about recipient being offline.
                    if (chat_status === ZmChatApp.OFFLINE || chat_status === ZmChatApp.BUSY) {
                        var chat_status_display = (chat_status === ZmChatApp.BUSY) ? ZmMsg.chatStatusBusy : ZmMsg.chatStatusOffline;
                        this.showStatusNotification(AjxMessageFormat.format(ZmMsg.chatMsgDeliveryRestricted, [fullname, chat_status_display]));
                        chatTextArea.prop('disabled',true);
                    }
                    var isNewChat = converseObject.newChats[this.model.get('jid')];
                    if (this.$el.is(':visible') && this.$el.css('opacity') == "1") {
                        if (isNewChat) {
                            delete converseObject.newChats[this.model.get('jid')];
                            return this.focus();
                        } else {
                            return this;
                        }
                    }
                    this.$el.fadeIn(callback);
                    if (converseObject.connection.connected) {
                        // Without a connection, we haven't yet initialized
                        // localstorage
                        this.model.save();
                        this.initDragResize();
                    }
                    this.setChatState('active');
                    if (isNewChat) {
                        delete converseObject.newChats[this.model.get('jid')];
                        return this.focus();
                    } else {
                        return this;
                    }
                },

                toggleEmoticonMenu: function (ev) {
                    ev.stopPropagation();
                    if (!$('.chat-textarea').prop('disabled')) {
                        this.$el.find('.toggle-smiley ul').slideToggle(200);
                    }
                },

                render: function () {
                    var contact = converseObject.roster.get(this.model.get('jid'));
                    this.$el.attr('id', this.model.get('box_id'))
                        .html(converseObject.templates.chatbox(
                            _.extend(this.model.toJSON(), {
                                    show_toolbar: converseObject.show_toolbar,
                                    label_personal_message: ZmMsg.chatTypeMessage,
                                    chat_status: contact ? contact.get('chat_status') : "online"
                                }
                            )
                        )
                    );
                    //ZCS - comment rendering of avatar.
                    this.renderToolbar(); //.renderAvatar();
                    converseObject.emit('chatBoxOpened', this);
                    setTimeout(converseObject.refreshWebkit, 50);
                    return this.showStatusMessage();
                }
            },
            ChatBoxViews: {
                trimChats: function (newchat) {
                    /* This method is called when a newly created chat box will
                     * be shown.
                     *
                     * It checks whether there is enough space on the page to show
                     * another chat box. Otherwise it minimize the oldest chat box
                     * to create space.
                     */
                    if (converseObject.no_trimming || (this.model.length <= 1)) {
                        return;
                    }
                    var oldest_chat,
                        controlbox_width = 0,
                        $minimized = converseObject.minimized_chats.$el,
                        minimized_width = _.contains(this.model.pluck('minimized'), true) ? $minimized.outerWidth(true) : 0,
                        boxes_width = newchat ? newchat.$el.outerWidth(true) : 0,
                        new_id = newchat ? newchat.model.get('id') : null,
                        controlbox = this.get('controlbox');

                    if (!controlbox || !controlbox.$el.is(':visible')) {
                        controlbox_width = converseObject.controlboxtoggle.$el.outerWidth(true);
                    } else {
                        controlbox_width = controlbox.$el.outerWidth(true);
                    }

                    _.each(this.getAll(), function (view) {
                        var id = view.model.get('id');
                        if ((id !== 'controlbox') && (id !== new_id) && (!view.model.get('minimized')) && view.$el.is(':visible')) {
                            boxes_width += view.$el.outerWidth(true);
                        }
                    });

                    if ((minimized_width + boxes_width + controlbox_width) > $('body').outerWidth(true)) {
                        oldest_chat = this.getOldestMaximizedChat();
                        if (oldest_chat && oldest_chat.get('id') !== new_id) {
                            //ZCS change - close the oldest chat instead of minimizing it.
                            var oldest_chat_view = converseObject.chatboxviews.get(oldest_chat.get('id'));
                            $(newchat.$el).each(function () {
                                $(this).insertAfter(oldest_chat_view.$el);
                                oldest_chat_view.close();
                            });
                        }
                    }
                }
            },
            XMPPStatusView: {
                el: "div#controlbox-tabs",  // ZCS - modified template, replaced ul/li tree with div based layout

                events: {
                    "click span.icon-plus": "toggleContactForm",
                    "click span.icon-search": "toggleSearchForm"
                },

                initialize: function () {
                    this._super.initialize.apply(this);
                    this.$tabs = this.$el;
                    this.removeContactFlyout = $('.remove-contact-flyout');
                    ZmChatApp.CHAT_EVENTS.bind("RemoveContact:showFlyout", this.showRemoveContactPanel, this);
                },

                render: function() {
                    var chat_status = this.model.get('status') || 'offline';
                        _self = this;

                    var LABEL_ONLINE = ZmMsg.chatStatusOnline,
                        LABEL_BUSY = ZmMsg.chatStatusBusy,
                        LABEL_AWAY = ZmMsg.chatStatusAway,
                        LABEL_OFFLINE = ZmMsg.chatStatusOffline;

                    // Makes remove contact form heading localized
                    var formHeading = this.removeContactFlyout.find('.flyout-heading span');
                    formHeading.html(ZmMsg.chatContactRemoveFormHeading);

                    // ZCS - contacts tab renders the UI for status drop down
                    this.$tabs.append(converseObject.templates.contacts_tab({
                        label_online: LABEL_ONLINE,
                        label_busy: LABEL_BUSY,
                        label_away: LABEL_AWAY,
                        label_offline: LABEL_OFFLINE
                    }));

                    this._super.render.apply(this);

                    //Replace Remove Contact Button with a custom button
                    this.$removeContactBtn = this.replaceButton({
                        cssClassName: 'remove-contact-btn',
                        btnText: ZmMsg.chatRemoveContactButton, // Makes remove button on the form localized
                        clickHandler: function(e) {
                            _self._contactToRemove.removeContact(e);
                        } 
                    }, this.removeContactFlyout.find('.removeContact'));
                    
                    //Replace Keep Contact Button with a custom button
                    this.$keepContactBtn = this.replaceButton({
                        btnText: ZmMsg.chatKeepContactButton, // Makes keep button on the form localized
                        clickHandler: function(e) {
                            _self._contactToRemove.keepContact(e);
                        } 
                    }, this.removeContactFlyout.find('.keepContact'));
                    
                    return this;
                },

                replaceButton: function (options, $btnToReplace) {
                    var $btn = new self.widgets.Button({
                        customClass: options.cssClassName,
                        model: { btnText: options.btnText },
                        customEvents: {
                            onClick: options.clickHandler
                        }
                    });
                    $btnToReplace.parent().append($btn.render().el);
                    $btnToReplace.remove();

                    return $btn;
                },

                showRemoveContactPanel: function (contact) {
                    //Store reference to the contact on which the remove opertaion has been initiated. 
                    //Based on the option chosen by the user in the removePanel the keepContact/removeContact method will be invoked on the above stored contact.
                    this._contactToRemove = contact;
                },

                setStatus: function (ev) {
                    ev.preventDefault();
                    var $el = $(ev.target),
                        value = $el.attr('data-value');
                    if (value === 'logout') {
                        this.$el.find(".dropdown dd ul").hide();
                        converseObject.logOut();
                    } else {
                        this.model.setStatus(value);
                        // Bug fix: Reset the status message whenever status is toggled from drop down
                        this.model.setStatusMessage('');
                        this.$el.find(".dropdown dd ul").hide();
                    }
                },

                getPrettyStatus: function (stat) {
                    var pretty_status;
                    var __ = $.proxy(utils.__, converseObject);
                    if (stat === 'chat' || stat === 'online') {
                        pretty_status = ZmMsg.chatStatusOnline;
                    } else if (stat === 'dnd') {
                        pretty_status = ZmMsg.chatStatusBusy;
                    } else if (stat === 'xa') {
                        pretty_status = ZmMsg.chatStatusAway;
                    } else if (stat === 'away') {
                        pretty_status = ZmMsg.chatStatusAway;
                    } else if (stat === 'offline') {
                        pretty_status = ZmMsg.chatStatusOffline;
                    }
                    else {
                        // Bug fix - Error: No translation key found.
                        // ZCS - Make first character upper case
                        pretty_status = stat && (__(stat).charAt(0).toUpperCase() + __(stat).slice(1)) || ZmMsg.chatStatusOnline;
                    }
                    return pretty_status;
                },

                toggleContactForm : function(ev) {
                    ev.preventDefault();

                    var plusIcon = $('.icon-plus');

                    if (plusIcon.attr("disabled") == "disabled") {
                        return;
                    }
                    
                    if(converseObject.controlboxView.$tooltip) {
                        converseObject.controlboxView.$tooltip.hide();
                    }

                    // Close the Remove Contact Flyout
                    this.removeContactFlyout.hide();

                    var addContactPanel = $('.add-contact-flyout'),
                        controlboxPane = $('.controlbox-panes'),
                        searchContactPanel = $('.search-contact-flyout'),
                        emailField = addContactPanel.find('#email'),
                        displayField = addContactPanel.find('#display'),
                        formSubmitBtn = converseObject.controlboxView.$formSubmitBtn,
                        formHeading = $('.flyout-heading').children().first(),
                        emailLabel = $(addContactPanel).find('.add-contact-form label[for=email]'),
                        displayLabel = $(addContactPanel).find('.add-contact-form label[for=display]');

                    emailField.removeAttr('disabled');
                    // Makes add contact form heading localized
                    formHeading.html(ZmMsg.chatAddContactFormHeading);
                    // Makes the add button localized
                    formSubmitBtn.setText(ZmMsg.chatAddContactButton);
                    // Makes the email field label localized
                    emailLabel.html(ZmMsg.chatAddContactEmailLabel);
                    // Makes the display name field label localized
                    displayLabel.html(ZmMsg.chatAddContactDisplayLabel);
                    // Makes the email input placeholder text localized
                    $(emailField).attr("placeholder", ZmMsg.chatAddContactEmailPlaceholderText);
                    // Makes the display input placeholder text localized
                    $(displayField).attr("placeholder", ZmMsg.chatAddContactDisplayPlaceholderText);

                    formSubmitBtn.disable();
                    formSubmitBtn.type = "addContact";

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
                        searchField = searchContactPanel.find('#search'),
                        formHeading = $(searchContactPanel).find('.flyout-heading').children().first();

                    // Makes the search contacts header localized
                    formHeading.html(ZmMsg.chatSearchContactFormHeading);
                    // Makes the search contact input placeholder localized
                    $(searchField).attr("placeholder", ZmMsg.chatSearchContactInputPlaceholderText);
                    controlboxPane.hide();
                    addContactPanel.hide();
                    searchContactPanel.show();

                    searchIcon.attr("disabled","disabled");
                    searchIcon.addClass('disabled');

                    searchField[0].focus();
                }
            },

            RosterContactView: {
                events: {
                    "click .alter-menu-xmpp-contact": "showAlterContactMenu",
                    "click li.removeContact": "showRemoveContactPanel",
                    "click li.renameContact": "toggleRenameForm"
                },

                initialize: function () {
                    this._super.initialize.apply(this);
                    this.removeContactPanel = $('.remove-contact-flyout');
                    this.controlboxPane = $('.controlbox-panes');
                },

                render: function() {
                    this._super.render.apply(this);
                    this.$el.find('.alter-menu-xmpp-contact').attr('title',ZmMsg.chatRenameRemoveDropdownTitle);
                    // Set contact removal warning message here since templates don't pick up ZmMsg strings
                    var msgContainer = $('.remove-contact-flyout .removeContactWarningMsg');
                    msgContainer.html(ZmMsg.chatContactRemovalWarning);

                    // The roster items have tooltips which need to be localized. These contacts could be subscribed, pending and requesting contacts.
                    var rosterContact = null,
                        titleText = '';

                    // We are dealing with pending contacts
                    if (this.$el.hasClass('pending-xmpp-contact') || this.$el.hasClass('requesting-xmpp-contact')) {
                        rosterContact = this.$el.find('span[title]');
                    }
                    // We are dealing with an subscribed contacts
                    else if (this.$el.hasClass('current-xmpp-contact')) {
                        rosterContact = this.$el.find('a[class=open-chat]');
                    }

                    // Bug: 103144 - Some of the options from Chat window are not localized
                    // While switching between requesting contact or pending contact to online contacts rosterContact object is not available.
                    if (rosterContact) {
                        titleText = rosterContact.prop('title');

                        if (titleText.toLowerCase().indexOf('name') > -1) {
                            titleText = titleText.replace('Name', ZmMsg.chatContactTooltipNameLabel);
                            rosterContact.prop('title', titleText);
                        }
                    }
                },

                showAlterContactMenu: function(ev) {
                    ev.preventDefault();

                    var alterContactMenu = $(ev.target.nextElementSibling);
                    var openedCustomMenu = $('.custom-menu.opened');

                    // Makes the dropdown menu items - Remove Contact and Rename Contact localized
                    var customMenu = $(alterContactMenu);
                    var menuItems = $(customMenu).children();
                    menuItems.first().html(ZmMsg.chatContactRenameOptionButton); // Rename button
                    menuItems.last().html(ZmMsg.chatContactRemoveOptionButton); // Remove button

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
                        formSubmitBtn = converseObject.controlboxView.$formSubmitBtn,
                        tooltip = converseObject.controlboxView.$tooltip,
                        jid = $(ev.target.parentNode).attr('data-jid') || $(ev.target.parentElement).attr('data-jid'),
                        formHeading = $('.flyout-heading').children().first(),
                        emailLabel = $(addContactPanel).find('.add-contact-form label[for=email]'),
                        displayLabel = $(addContactPanel).find('.add-contact-form label[for=display]');

                    if(tooltip) {
                        tooltip.hide();
                    }
                    
                    // button.removeClass().addClass('renameContact');
                    formSubmitBtn.type = "renameContact";
                    // Makes the Rename button localized
                    formSubmitBtn.setText(ZmMsg.chatRenameContactButton)
                    // Makes the Rename Contact form localized
                    formHeading.html(ZmMsg.chatRenameContactFormHeading);

                    // Makes the email field label localized
                    emailLabel.html(ZmMsg.chatAddContactEmailLabel);
                    // Makes the display name field label localized
                    displayLabel.html(ZmMsg.chatAddContactDisplayLabel);
                    // Makes the display input placeholder text localized
                    $(displayField).attr("placeholder", ZmMsg.chatAddContactDisplayPlaceholderText);

                    controlboxPane.hide();
                    addContactPanel.show();
                    emailField[0].value = jid;
                    emailField.attr('disabled', 'disabled');
                    emailField.removeClass();
                    displayField[0].value = "";
                    displayField[0].focus();
                },

                removeContact: function (ev) {
                    if (ev && ev.preventDefault) { ev.preventDefault(); }
                    if (!converseObject.allow_contact_removal) { return; }

                    this.controlboxPane.show();
                    this.removeContactPanel.hide();

                    var iq = $iq({type: 'set'})
                        .c('query', {xmlns: Strophe.NS.ROSTER})
                        .c('item', {jid: this.model.get('jid'), subscription: "remove"});

                    converseObject.connection.sendIQ(iq,
                        function (iq) {
                            this.model.destroy();
                            this.remove();
                        }.bind(this),
                        function (err) {
                            console.log(__("Sorry, there was an error while trying to remove "+name+" as a contact."));
                            converseObject.log(err);
                        }
                    );
                },

                keepContact: function (ev) {
                    if (ev && ev.preventDefault) { ev.preventDefault(); }
                    this.removeContactPanel.hide();
                    this.controlboxPane.show();
                },

                showRemoveContactPanel: function(ev) {
                    this.controlboxPane.hide();
                    this.removeContactPanel.show();
                    ZmChatApp.CHAT_EVENTS.trigger("RemoveContact:showFlyout", this);
                },

                openChat: function (ev) {
                    converseObject.newChats[this.model.attributes.jid] = true;
                    this._super.openChat.apply(this);
                }
            },

            ControlBoxView: {
                events: {
                    'click span.close-chatbox-button': 'close',
                    'click span.add-contact-flyout-close': 'closeAddContactForm', // ZCS - event for add contact form close
                    'submit form.add-contact-form': 'addContactFromForm', // ZCS - event for add contact form submit button
                    'keydown form.add-contact-form': 'handleKeyEventsOnForm',
                    'click span.search-contact-flyout-close': 'closeSearchContactForm',
                    'keyup input#search': 'searchContacts',
                    "click .zmsearch-xmpp a.open-chat": 'openSearchedContactChat',
                    'keyup #email':  'contentChanged',
                    'click a.conn-retry': 'reconnect'
                },
                initialize: function () {
                    this._super.initialize.apply(this);
                    _.bindAll(this, 'contentChanged');
                    converseObject.controlboxView = this;
                    
                },
                render: function () {
                    this._super.render.apply(this);
                    this.$formSubmitBtn = new self.widgets.Button({
                        customClass: 'add-contact-btn',
                        model: {btnText: ''}
                    });
                    var $addContactBtn = this.$('.add-contact-form button');
                    $addContactBtn.parent().append(this.$formSubmitBtn.render().el);
                    $addContactBtn.remove();
                    return this;
                },
                addTooltip : function () {
                    this.$tooltip = new self.widgets.Tooltip({
                        $el: this.$el.find('#email').parent(),
                        append: true,
                        model: {
                            tooltipContent: ZmMsg.chatInvalidEmailMsg,
                            okBtnText: ZmMsg.ok
                        }
                    });
                },
                /**
                 * Closes add contact form.
                 *
                 */
                closeAddContactForm: function() {
                    var addContactPanel = $('.add-contact-flyout'),
                        controlboxPane = $('.controlbox-panes'),
                        plusIcon = $('.icon-plus'),
                        searchIcon = $('.icon-search');

                    controlboxPane.show();
                    addContactPanel.hide();
                    plusIcon.removeAttr("disabled","disabled");
                    plusIcon.removeClass('disabled');

                    searchIcon.removeAttr("disabled","disabled");
                    searchIcon.removeClass('disabled');
                },

                /**
                 * Closes search contact form.
                 *
                 */
                closeSearchContactForm: function() {
                    var controlboxPane = $('.controlbox-panes'),
                        searchContactPanel = $('.search-contact-flyout'),
                        searchField = searchContactPanel.find('#search'),
                        plusIcon = $('.icon-plus'),
                        searchIcon = $('.icon-search'),
                        searchPanel = $('.search-converse-contact'),
                        searchedContactPanel = $('.search-converse-contact .zmsearch-xmpp');

                    controlboxPane.show();
                    searchContactPanel.hide();
                    searchIcon.removeAttr("disabled","disabled");
                    searchIcon.removeClass('disabled');

                    plusIcon.removeAttr("disabled","disabled");
                    plusIcon.removeClass('disabled');

                    searchField.val('');
                    searchedContactPanel.html('');
                    searchPanel.hide();
                },

                /**
                 * Add/Update contacts to the roster based on form input.
                 *
                 * @param   {object}      ev        the event object
                 */
                addContactFromForm: function (ev) {
                    ev.preventDefault();
                    if(!this.$tooltip) this.addTooltip();

                    var $email = $(ev.target).find('#email'),
                        $displayName = $(ev.target).find('#display'),
                        jid = $email.val(),
                        alias = $displayName.val();

                    if (!jid) {
                        // this is not a valid JID
                        $email.addClass('error');
                        return;
                    }

                    if (!AjxUtil.isEmailAddress(jid)) {
                        this.$tooltip.show();
                        return;
                    }

                    this.$tooltip.hide();

                    var addContactPanel = $('.add-contact-flyout'),
                        button = addContactPanel.find('.button button'),
                        formHeading = $('.flyout-heading').children().first();

                    this.closeAddContactForm();

                    // Update display name of the already added contact
                    if (this.$formSubmitBtn.type === "renameContact") {
                        this.$formSubmitBtn.setText(ZmMsg.chatAddContactButton);
                        formHeading.html(ZmMsg.chatAddContactFormHeading);
                        this.$formSubmitBtn.type = "addContact";

                        $email.removeAttr('disabled');

                        this.renameContact(converseObject.roster.get(jid), alias);

                    }
                    else {
                        converseObject.roster.addAndSubscribe(jid, _.isEmpty(alias)? jid : alias);
                    }
                },

                renameContact: function(contact, alias) {

                    // Check helps if the contact being renamed unsubscribes itself from the buddy list
                    if (contact) {
                        contact.attributes.fullname = alias;
                        //update name in any open chat views.
                        var chatview = converseObject.chatboxviews.get(contact.attributes.jid);
                        if (chatview) {
                            $(chatview.el).find('.chat-title>span.header-contact-name').html(alias);
                        }
                        converseObject.getVCard(contact.get('jid'));
                    }

                    var jid = contact.attributes.jid;

                    var deferred = new $.Deferred();

                    converseObject.roster.sendContactRenameIQ(jid, alias, null,
                        function (iq) {
                            var contact = this.create(_.extend({
                                fullname: alias,
                                jid: jid,
                                subscription: 'both'
                            }));
                            deferred.resolve(contact);
                        }.bind(this),
                        function (err) {
                            converse.log(err);
                            deferred.resolve(err);
                        }
                    );

                    return deferred.promise();
                },

                /**
                 * Adds contacts to the roster based on form input.
                 *
                 * @param   {string}      jid        jabber ID
                 * @param   {string}      name       display name for contact
                 */
                addContact: function (jid, name) {
                    converseObject.connection.roster.add(jid, name, [], function (iq) {
                        converseObject.connection.roster.subscribe(jid, null, name);
                    });
                },

                /**
                 * Searches for roster contacts. Pending contacts are restricted from being searched.
                 *
                 */
                searchContacts: function (ev) {
                    ev.preventDefault();

                    var __ = $.proxy(utils.__, converseObject);

                    var searchString = $(ev.target).val() || " ",
                        searchPanel = $('.search-converse-contact'),
                        searchedContactPanel = $('.search-converse-contact .zmsearch-xmpp'),
                        searchedContactCount = $('.searchedContactCount'),
                        allMatchingContacts = converseObject.roster.filter(contains(['fullname', 'jid'], searchString)),
                        matchedContacts = allMatchingContacts.filter(contains(['subscription'], 'both'));

                    searchedContactPanel.html('');
                    searchPanel.show();

                    _.each(matchedContacts, function (contactItem) {
                        searchedContactPanel.append(converseObject.templates.roster_item(
                            _.extend(contactItem.toJSON(), {
                                'desc_status': self._getChatUserStatus(contactItem.get('chat_status'), contactItem.get('user_id')),
                                'desc_chat': __('Click to chat with this contact'),
                                'desc_remove': __('Click to remove this contact'),
                                'allow_contact_removal': false
                            })
                        ));
                    });

                    if (matchedContacts.length === 1) {
                        searchedContactCount.text(matchedContacts.length + ' contact found');
                    } else {
                        searchedContactCount.text(matchedContacts.length + ' contacts found');
                    }

                    if (matchedContacts.length === 0) {
                        searchedContactPanel.html('');
                        searchedContactCount.text('0 contact found');
                    }

                    this.model.set({searchedContacts: matchedContacts});
                },

                /**
                 * Open chat window for searched contact on tap.
                 *
                 */
                openSearchedContactChat: function(ev) {
                    if (ev && ev.preventDefault) {
                        ev.preventDefault();
                    }
                    var clickedContactJID = ev.target.text,
                        clickedContact = this.model.get('searchedContacts').filter(contains(['fullname', 'jid'], ev.target.text))[0];

                    return converseObject.chatboxviews.showChat(clickedContact.attributes);
                },
                contentChanged: function(e) {
                   this.$emailInput = this.$emailInput || this.$('#email');
                   this.$displayName = this.$displayName || this.$('#display');

                   var val = $.trim(this.$emailInput.val());
                   //Update display name to match the email input
                   this.$displayName.val(val);

                   if(val === '') {
                        converseObject.controlboxView.$formSubmitBtn.disable();
                        return;
                    }

                    converseObject.controlboxView.$formSubmitBtn.enable();
                },

                renderLoginPanel: function() {
                    this.$el.html(converseObject.templates.controlbox(this.model.toJSON()));
                    var cfg = {'$parent': this.$el.find('.controlbox-panes'), 'model': this};
                    if (!this.loginpanel) {
                        this.loginpanel = new converseObject.LoginPanel(cfg);
                        if (converseObject.allow_registration) {
                            this.registerpanel = new converseObject.RegisterPanel(cfg);
                        }
                    } else {
                        this.loginpanel.delegateEvents().initialize(cfg);
                        if (converseObject.allow_registration) {
                            this.registerpanel.delegateEvents().initialize(cfg);
                        }
                    }

                    // Model's "connected" property is set to false if connection drops
                    if (this.model.get('connected') === false) {
                        var spinner = this.loginpanel.$('.spinner');
                        var connFeedback = this.loginpanel.$('.conn-feedback');
                        var connError = this.loginpanel.$('.conn-error');
                        var connErrorRetry = this.loginpanel.$('.conn-error-retry');
                        var connErrorRetryBtn = this.loginpanel.$('.conn-retry');
                        var minimizedRoster = $('#toggle-controlbox');
                        var controlbox = $('#controlbox');

                        spinner.hide();
                        connFeedback.hide();
                        connError.html(ZmMsg.chatConnectionError);
                        connErrorRetryBtn.html(ZmMsg.chatRetryButton);
                        connError.show();
                        connErrorRetry.show();

                        this.loginpanel.render();

                        // Reset the timer to 0 to make sure it doesn't produce a NaN.
                        ZmChatApp.TIMERS.ConnectTriggerCount = 0;

                        var chatPaneHeader = $('#controlbox-tabs').find('a[href=#login-dialog]');
                        chatPaneHeader.html(ZmMsg.chatFeatureDisconnected);

                        //Append a minimize button in case of XMPP service disconnected.
                        $('#controlbox-tabs li:first').after('<a href="#controlbox-tabs" class="conn-disconnect icon-opened"></a>');

                        var thiz = this;

                        $('#controlbox-tabs .conn-disconnect').on('click', function() {
                            thiz.toggleControlBox();
                        });

                        // If the roster was minimized and connection dropped, replace it with our custom header pane and controlbox panel.
                        if (minimizedRoster.is(':visible')) {
                            minimizedRoster.hide();
                            controlbox.show();
                            //show controlbox in minimized state
                            this.toggleControlBox();
                        }
                    }
                    else {
                        // Keep control box rendering separate in case of connected/disconnected
                        this.loginpanel.render();
                    }

                    if (converseObject.allow_registration) {
                        this.registerpanel.render().$el.hide();
                    }
                    this.initDragResize();

                    return this;
                },

                toggleControlBox: function() {
                    var boxFlyout = $('.box-flyout');
                    var toggleControlIcon = $('#controlbox-tabs .conn-disconnect');
                    var height = $('#controlbox-tabs').find('a[href=#login-dialog]').height();

                    if (boxFlyout.height() < 40) {
                        //converse default_box_height
                        boxFlyout.height(400);
                        toggleControlIcon.addClass('icon-opened');
                        toggleControlIcon.removeClass('icon-closed');
                    }
                    else {
                        boxFlyout.height(height);
                        toggleControlIcon.removeClass('icon-opened');
                        toggleControlIcon.addClass('icon-closed');
                    }
                },
                reconnect: function() {
                    var retryBtn = $('a.conn-retry');
                    if (retryBtn.hasClass('conn-retry-disabled')) {
                        return;
                    }

                    $.ajax({
                        type: "HEAD",
                        url: "/public/blank.html",
                        cache: false
                    }).done(function() {
                            // Set a trigger counter to stop ZChatConnect being fired by Retry and Auto-reconnect
                            ZmChatApp.TIMERS.ConnectTriggerCount++;

                            retryBtn.addClass('conn-retry-disabled');
                            ZmChatApp.isServerReachable = true;
                            ZmChatApp.CHAT_EVENTS.trigger("ZChatConnect");
                    }).always(function() {
                            // Disable the button for XHR complete state
                            retryBtn.addClass('conn-retry-disabled');
                    }).fail(function() {
                            // Reset trigger counter to and let it be driven by retry or auto-reconnect handlers
                            ZmChatApp.TIMERS.ConnectTriggerCount = 0;

                            retryBtn.removeClass('conn-retry-disabled');
                    });
                },
                handleKeyEventsOnForm: function(e) {
                    //For Tabbing events happening on the form, irrespective of Tab or Shift+Tab, prevent propagation to the Dwt handlers.
                    if( e.which === 9 ) {
                        e.stopPropagation();
                    }
                }
            },

            RosterView: {
                $roster_count: null,
                update: _.debounce(function () {
                    var $count = $('#online-count');
                    var onlineContactsCount = converseObject.roster.getNumOnlineContacts();
                    // ZCS - formats online contact count for minimized buddy list
                    $count.text(onlineContactsCount);

                    // ZCS - modified roster template to add online contacts count
                    
                    if(!this.$roster_count || this.$roster_count.length === 0) {
                        this.$roster_count = $('[id="' + __('My contacts') + '"]');
                    }
                    this.$roster_count.text(headerTextGenerator.getOnlineContactsHeaderText(onlineContactsCount));

                    if (!$count.is(':visible')) {
                        $count.show();
                    }
                    if (this.$roster.parent().length === 0) {
                        this.$el.append(this.$roster.show());
                    }
                    return this.showHideFilter();
                }, converse.animate ? 100 : 0)
            },

            LoginPanel: {
                render: function () {
                    this.$tabs.append(converseObject.templates.login_tab({label_sign_in: ZmMsg.chatLoginPaneHeader}));
                    this.$el.find('input#jid').focus();
                    if (!this.$el.is(':visible')) {
                        this.$el.show();
                    }

                    var spinnerContainer = $('.conn-feedback');
                    spinnerContainer.html(ZmMsg.chatConnecting);

                    return this;
                }
            },

            RosterGroupView: {
                render: function () {
                    this._super.render.apply(this);
                    this.$headerText = this.$('[id="' + this.model.get('name') + '"]');
                    
                    this.model.contacts.on("add", this.updateGroupHeader, this);
                    this.model.contacts.on("change:subscription", this.updateGroupHeader, this);
                    this.model.contacts.on("change:requesting", this.updateGroupHeader, this);
                    this.model.contacts.on("destroy", this.updateGroupHeader, this);
                    this.model.contacts.on("remove", this.updateGroupHeader, this);
                    
                    //Store string for comparison. Compare against localised string
                    this._PENDING_CONTACTS = __("Pending contacts");
                    this._CONTACT_REQUESTS = __('Contact requests');
                    this._MY_CONTACTS = __('My contacts');
                    return this;
                },
                updateGroupHeader: function () {
                    var totalContactsInGroup = this.model.contacts.length,
                        headerText;
                    //Fetch appropriate group header text
                    switch (this.model.get('name')) {
                        case this._MY_CONTACTS :
                            headerText = headerTextGenerator.getOnlineContactsHeaderText(converseObject.roster.getNumOnlineContacts());
                            break;    
                        case this._PENDING_CONTACTS :
                            headerText = headerTextGenerator.getPendingContactsHeaderText(totalContactsInGroup);
                            break;    
                        case this._CONTACT_REQUESTS :
                            headerText = headerTextGenerator.getContactRequestsHeaderText(totalContactsInGroup);
                            break;
                    }
                    if(headerText) {
                        this.$headerText.html(headerText);
                    }
                }
                
            },

            RosterContacts: {
                sendContactRenameIQ: function(jid, alias, groups, callback, errback) {
                    // RFC to update a contact with a nickname
                    // https://xmpp.org/rfcs/rfc3921.html#rfc.section.7.5

                    /*  Send an IQ stanza to the XMPP server to rename a roster contact.
                     *  Parameters:
                     *    (String) jid - The Jabber ID of the user being added
                     *    (String) alias - The alias of that user
                     *    (Array of Strings) groups - Any roster groups the user might belong to
                     *    (Function) callback - A function to call once the VCard is returned
                     *    (Function) errback - A function to call if an error occured
                     */

                    // TODO - 'groups' will be null as we are not adding the users to any chat groups
                    var iq = $iq({type: 'set'})
                        .c('query', {xmlns: Strophe.NS.ROSTER})
                        .c('item', { jid: jid, name: alias });
                    _.map(groups, function (group) { iq.c('group').t(group).up(); });
                    converseObject.connection.sendIQ(iq, callback, errback);
                },

                /**
                 * Handles the mapping and setting of 'changed/modified' xmpp status of the logged in user or the buddies.
                 * This will also be called when a contact is added to the buddy list, we fetch their xmpp status and update from here.
                 *
                 *
                 * @param   {object}      presence        An object that contains a user's xmpp presence
                 */
                presenceHandler: function (presence) {
                    var $presence = $(presence),
                        presence_type = presence.getAttribute('type');
                    if (presence_type === 'error') { return true; }
                    var jid = presence.getAttribute('from'),
                        bare_jid = Strophe.getBareJidFromJid(jid),
                        resource = Strophe.getResourceFromJid(jid),
                        chat_status = $presence.find('show').text() || 'online',
                        status_message = $presence.find('status'),
                        contact = this.get(bare_jid);
                    if (this.isSelf(bare_jid)) {
                        if ((converseObject.connection.jid !== jid) && (presence_type !== 'unavailable')) {
                            // Another resource has changed its status, we'll update ours as well.
                            converseObject.xmppstatus.save({'status': chat_status});
                            converseObject.xmppstatus.save({'status_message': status_message.length ? self._getXMPPStatus(status_message.text()) : self._getXMPPStatus(chat_status.toLowerCase())});
                        }
                        return;
                    } else if (($presence.find('x').attr('xmlns') || '').indexOf(Strophe.NS.MUC) === 0) {
                        return; // Ignore MUC
                    }
                    if (contact && (status_message.text() != contact.get('status'))) {
                        contact.save({'status': status_message.text()});
                    }
                    if (presence_type === 'subscribed' && contact) {
                        contact.ackSubscribe();
                    } else if (presence_type === 'unsubscribed' && contact) {
                        contact.ackUnsubscribe();
                    } else if (presence_type === 'unsubscribe') {
                        return;
                    } else if (presence_type === 'subscribe') {
                        this.handleIncomingSubscription(jid);
                    } else if (presence_type === 'unavailable' && contact) {
                        // Only set the user to offline if there aren't any
                        // other resources still available.

                        // TODO: Bug within converse. https://github.com/jcbrand/converse.js/issues/487
                        //if (contact.removeResource(resource) === 0) {
                        contact.save({'chat_status': chat_status.toLowerCase() == 'xa' ? 'away' : 'offline'});
                        //}
                    } else if (contact) { // presence_type is undefined
                        this.addResource(bare_jid, resource);
                        contact.save({'chat_status': chat_status.toLowerCase() == 'xa' ? 'away' : chat_status});
                    }
                },

                /**
                 * Updates the contact item based on the IQ response received to and from XMPP server.
                 * The item gets updated when a contact is updated in case of subscribe, authorize and unsubscribe.
                 *
                 *
                 * @param   {object}      item        The IQ query response item received in the form of a stanza from XMPP server.
                 */
                updateContact: function (item) {
                    /* Update or create RosterContact models based on items
                     * received in the IQ from the server.
                     */
                    var jid = item.getAttribute('jid');
                    if (this.isSelf(jid)) { return; }
                    var groups = [],
                        contact = this.get(jid),
                        ask = item.getAttribute("ask"),
                        subscription = item.getAttribute("subscription");
                    $.map(item.getElementsByTagName('group'), function (group) {
                        groups.push(Strophe.getText(group));
                    });
                    if (!contact) {
                        if ((subscription === "none" && ask === null) || (subscription === "remove")) {
                            return; // We're lazy when adding contacts.
                        }
                        this.create({
                            ask: ask,
                            fullname: item.getAttribute("name") || jid,
                            groups: groups,
                            jid: jid,
                            subscription: subscription
                        }, {sort: false});
                    } else {
                        if (subscription === "remove") {
                            return contact.destroy(); // will trigger removeFromRoster
                        }
                        // We only find out about requesting contacts via the
                        // presence handler, so if we receive a contact
                        // here, we know they aren't requesting anymore.
                        // see docs/DEVELOPER.rst

                        /*
                         * Bug: 103135 - Pending Contact Roster Header not correct
                         * By changing the subscription we are kind of auto-subscribing the users to each other.
                         */
                        if (subscription === "from") {
                            subscription = "to";

                            // Remove the ask attribute to auto-subscribe to requesting user's roster.
                            if (ask === "subscribe") {
                                ask = null;
                            }
                        }

                        contact.save({
                            subscription: subscription,
                            ask: ask,
                            requesting: null,
                            groups: groups
                        });
                    }
                }
            }
        }
    });

    converse.initialize({
        allow_otr: false,
        i18n: locales[appCtxt.get(ZmSetting.LOCALE_NAME)],
        bosh_service_url: url,
        authentication: 'prebind',
        prebind_url: AjxUtil.formatUrl({path: '/service/extension/zimbraim/'}),
        auto_login: true,
        keepalive: true,
        storage: 'local',
        allow_logout: false,
        show_controlbox_by_default: true,
        roster_groups: false,
        play_sounds: appCtxt.get(ZmSetting.CHAT_PLAY_SOUND),
        sounds_path: "/public/sounds/",
        jid: jid
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

ZmChatApp.prototype.getRosterContact =
function(jid) {
    return appCtxt.get(ZmSetting.CHAT_ENABLED) && converse.contacts.get(jid);
};

ZmChatApp.prototype.startChat =
function(jid) {
    if (appCtxt.get(ZmSetting.CHAT_ENABLED)) {
        converse.chats.open(jid);
    }
};

ZmChatApp.prototype._initWidgets =
function () {
    this._initToolTip();
    this._initButton();
}



ZmChatApp.prototype._initToolTip =
function () {
    var self = this;

    this.widgets.Tooltip = Backbone.View.extend({
        template:  _.template(this._getTooltipTemplate()),
        initialize: function (options) {
            this.$el = options.$el;
            this.append = options.append || false;
            this.render();
        },
        render: function() {
            //using _.template to reduce number of dependencies
            var html = this.template(this.model);
            var _self = this;

            if (this.append) {
                this.$el.append(html);
            }
            else {
                this.$el.html(html);
            }
            this.$tooltip = this.$el.find('.js-converse-tooltip');
            this.$btn = new self.widgets.Button({
                customClass: 'tooltip-btn',
                model: { btnText: ZmMsg.ok },
                customEvents: {
                    onClick: function (e) {
                        _self.okBtnClickHandler(e);
                    }
                }
            });
            
            this.$tooltip.find('.DwtDialogButtonBar').append(this.$btn.render().el);
            this.$tooltip.hide();
            return this;
        },
        show: function (e) {
            this.$tooltip.show();
        },
        hide: function (){
            this.$tooltip.hide();
        },

        okBtnClickHandler: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }
    });
}

ZmChatApp.prototype._initButton =
function () {
    this.widgets.Button = Backbone.View.extend({
        el: '<span class="ZHasText ZButton">',
        template:  _.template(  '<button class="ZWidgetTable ZButtonTable ZButtonBorder">' +
                                    '<span class="ZWidgetTitle">{{btnText}}</span>' +
                                '</button>'),
        cssClass: {
            disabled: 'ZDisabled',
            hover: 'ZHover'
        },
        events: {
            'click button': 'btnClickHandler',
            'focus button': 'btnFocusHandler',
            'blur button': 'btnBlurHandler',
            'mouseover': 'btnMouseOverHandler',
            'mouseout': 'btnMouseOutHandler'
        },
        initialize: function (options) {
            this.customClass = options.customClass;
            this.customEvents = options && options.customEvents;
        },
        
        render: function() {
            //using _.template to reduce number of dependencies
            var html = this.template(this.model);
            $(this.el).html(html);
            this.$btnWrapper = $(this.el);
            if(this.customClass) {
                this.$btnWrapper.addClass(this.customClass);
            }
            this.$btn = this.$btnWrapper.find('button');
            this.$btnText = this.$btnWrapper.find('.ZWidgetTitle');
            return this;
        },
        
        disable: function () {
            this.$btnWrapper.addClass(this.cssClass.disabled);
            this.$btn.attr('disabled', 'disabled');
        },
        
        enable: function () {
            this.$btnWrapper.removeClass(this.cssClass.disabled);
            this.$btn.removeAttr('disabled');
        },
        
        setText: function (text) {
            this.$btnText.html(text);
        },
        
        btnMouseOverHandler: function (e) {
            this.$btnWrapper.addClass(this.cssClass.hover);
        },

        btnMouseOutHandler: function (e) {
            this.$btnWrapper.removeClass(this.cssClass.hover);
        },

        btnClickHandler: function(e) {
            if(this.customEvents && this.customEvents['onClick']){
                this.customEvents['onClick'].apply(this,[e]);
            }
        },

        btnFocusHandler: function(e) {
            this.$btnWrapper.addClass('ZFocused');
        },
        btnBlurHandler: function(e) {
            this.$btnWrapper.removeClass('ZFocused');
        }
    });
}

ZmChatApp.prototype._getTooltipTemplate =
function () {
    var tooltip = [];
    tooltip.push('<div class="DwtToolTip js-converse-tooltip">')
    tooltip.push('<div class="DwtToolTipBody">')
    tooltip.push('<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" height="100%">')
    tooltip.push('<tbody>')
    tooltip.push('<tr>')
    tooltip.push('<td valign="top">')
    tooltip.push('<div class="ImgCritical_32">')
    tooltip.push('<span class="ScreenReaderOnly">Critical</span>')
    tooltip.push('</div>')
    tooltip.push('</td>')
    tooltip.push('<td role="document" class="DwtMsgArea js-tooltip-content">{{tooltipContent}}</td>')
    tooltip.push('</tr>')
    tooltip.push('<tr>')
    tooltip.push('<td colspan="2">')
    tooltip.push('<div class="horizSep"></div>')
    tooltip.push('</td>')
    tooltip.push('</tr>')
    tooltip.push('<tr>')
    tooltip.push('<td colspan="2" class="DwtDialogButtonBar" align="center">')
    tooltip.push('</td>')
    tooltip.push('</tr>')
    tooltip.push('</tbody>')
    tooltip.push('</table>')
    tooltip.push('</div>')
    tooltip.push('</div>')
    tooltip.push('</div>');

    return tooltip.join('');
}

ZmChatApp.prototype._getChatUserStatus =
function(chat_status, fullname) {
    switch (chat_status) {
        case 'online' :
            return AjxMessageFormat.format(ZmMsg.chatUserOnline, fullname);
        case 'away' :
            return AjxMessageFormat.format(ZmMsg.chatUserAway, fullname);
        case 'dnd' :
            return AjxMessageFormat.format(ZmMsg.chatUserBusy, fullname);
        case 'offline' :
            return AjxMessageFormat.format(ZmMsg.chatUserOffline, fullname);
    }
};

ZmChatApp.checkServerStatus =
function(doStop, doNotTrigger, callback) {

    $.ajax({
        type: "HEAD",
        url: "/public/blank.html",
        cache: false,
        statusCode: {
            0: function() {
                if (ZmChatApp.isServerReachable === true) {
                    if (doStop) {
                        // Reset here - state must be correct for functions triggered by ZChatDisconnect
                        ZmChatApp.isServerReachable = false;
                        if (!doNotTrigger) {
                            // Reset the trigger counter when disconnected and let retry or auto-reconnect drive the trigger count.
                            ZmChatApp.TIMERS.ConnectTriggerCount = 0;
                            ZmChatApp.CHAT_EVENTS.trigger("ZChatDisconnect");
                        }
                    }
                    else {
                        return ZmChatApp.checkServerStatus(true);
                    }
                }
                ZmChatApp.isServerReachable = false;
            },
            200: function() {
                if (ZmChatApp.isServerReachable === false) {
                    if (doStop) {
                        // Reset here - state must be correct for functions triggered by ZChatConnect
                        ZmChatApp.isServerReachable = true;
                        if (!doNotTrigger) {
                            // Increment the connect trigger count to keep track of event trigger activity
                            ZmChatApp.TIMERS.ConnectTriggerCount++;
                            ZmChatApp.CHAT_EVENTS.trigger("ZChatConnect");
                        }
                    }
                    else {
                        return ZmChatApp.checkServerStatus(true);
                    }
                }
                ZmChatApp.isServerReachable = true;
            }
        },
        complete: callback
    });
 };
ZmChatApp.checkServerStatus(true, true);

ZmChatApp.prototype._getXMPPStatus =
function(chat_status) {
    switch (chat_status) {
        case 'online' :
            return ZmMsg.chatStatusOnline;
        case 'away' :
            return ZmMsg.chatStatusAway;
        case 'dnd' :
            return ZmMsg.chatStatusBusy;
        case 'offline' :
            return ZmMsg.chatStatusOffline;
        case 'xa' :
            return ZmMsg.chatStatusAway;
        default:
            return ZmMsg.chatStatusOffline;
    }
};