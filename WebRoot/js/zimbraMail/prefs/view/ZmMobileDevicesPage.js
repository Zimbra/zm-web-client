/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the mobile devices page.
 * @class
 * This class represents the mobile devices page.
 * 
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 * 
 * @extends	ZmPreferencesPage
 * 
 * @private
 */
ZmMobileDevicesPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);

	this._deviceController = controller.getMobileDevicesController();
};

ZmMobileDevicesPage.prototype = new ZmPreferencesPage;
ZmMobileDevicesPage.prototype.constructor = ZmMobileDevicesPage;

ZmMobileDevicesPage.prototype.toString =
function () {
    return "ZmMobileDevicesPage";
};


// ZmPreferencesPage methods

/**
 * @private
 */
ZmMobileDevicesPage.prototype.showMe =
function() {
	ZmPreferencesPage.prototype.showMe.apply(this, arguments);

	if (!this._rendered) {
		var params = {
			parent:this,
			buttons:this._deviceController.getToolbarButtons(),
			posStyle:Dwt.STATIC_STYLE,
			context:ZmId.VIEW_MOBILE_DEVICES,
			parentElement:(this._htmlElId+"_deviceToolbar")
		};
		this._toolbar = new ZmButtonToolBar(params);
		params = {
			parent:this,
			parentElement:(this._htmlElId+"_deviceList")
		};
		this.listView = new ZmMobileDeviceListView(params);
		this.listView.setMultiSelect(false);

		this._deviceController.initialize(this._toolbar, this.listView);

        var params1 = {
            parent: this,
            parentElement: (this._htmlElId + "_oauthconsumerapps"),
            type: ZmMobileDevice.TYPE_OAUTH
        };
        this.oAuthAppsListView = new ZmMobileDeviceListView(params1);
        this._deviceController.initializeOAuthAppListView(this.oAuthAppsListView);

        var pageId = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView().getView("MOBILE").getHTMLElId();
        this._addListView(this.oAuthAppsListView, pageId + "_oauthconsumerapps");
        this._mobileConfiguration(pageId+"_mobileConfig");
        this._rendered = true;
	}
	this._deviceController.loadDeviceInfo();
    this._deviceController.loadOAuthConsumerAppInfo();
};

ZmMobileDevicesPage.prototype.reset = function(useDefaults) {
    var deviceController = this._deviceController;
    ZmPreferencesPage.prototype.reset.apply(this, arguments);

    if (this._controller.getTabView().getActiveView() == this) {
        deviceController.loadDeviceInfo();
        deviceController.loadOAuthConsumerAppInfo();
    }
};

ZmMobileDevicesPage.prototype.hasResetButton =
function() {
	return false;
};

ZmMobileDevicesPage.prototype._addListView = function(listView, listViewDivId) {
        var listDiv = document.getElementById(listViewDivId);
        listDiv.appendChild(listView.getHtmlElement());
        listView.setUI(null, true);
        listView._initialized = true;
};


/**
 * Creates a mobile device list.
 * @class
 * A list view that displays user mobile devices. The data is in the form of a
 * list of {@link ZmMobileDevice} objects.
 *
 * @param {Hash}	params	a hash of parameters
 * 
 * 
 * @extends		DwtListView
 * 
 * @private
 */
ZmMobileDeviceListView = function(params) {
    this.type = params.type;
	params.headerList = this._getHeaderList();
	DwtListView.call(this, params);
};

ZmMobileDeviceListView.prototype = new DwtListView;
ZmMobileDeviceListView.prototype.constructor = ZmMobileDeviceListView;


// Consts

ZmMobileDevicesPage.ALL                 = "all";
ZmMobileDevicesPage.DAV                 = "dav";
ZmMobileDevicesPage.CALDAV              = "caldav";
ZmMobileDevicesPage.CARDDAV             = "carddav";
ZmMobileDevicesPage.IMAP                = "imap";
ZmMobileDevicesPage.ID_DOWNLOAD_CONFIG  = "downloadButton";
ZmMobileDevicesPage.ID_CONFIG_TYPE      = "configType";

ZmMobileDeviceListView.F_DEVICE         = "de";
ZmMobileDeviceListView.F_STATUS         = "st";
ZmMobileDeviceListView.F_ID             = "id";
ZmMobileDeviceListView.F_PROTOCOL       = "pr";
ZmMobileDeviceListView.F_PROVISIONABLE  = "pv";

ZmMobileDeviceListView.F_APP            = "ap";
ZmMobileDeviceListView.F_APPDEVICE      = "ad";
ZmMobileDeviceListView.F_APPROVED       = "ar";
ZmMobileDeviceListView.F_ACTIONS        = "ac";


// Public methods

ZmMobileDeviceListView.prototype.toString =
function() {
	return "ZmMobileDeviceListView";
};

ZmMobileDevicesPage.prototype._downloadUrl = 
function() {

    var portPrefix = (location.port == "" || location.port == "80")
			? ""
            : (":" + location.port);
    var username = appCtxt.multiAccounts ? (AjxStringUtil.urlComponentEncode(appCtxt.get(ZmSetting.USERNAME))) : "~";
    var uri=[
        location.protocol, "//", location.hostname, portPrefix, "/service/home/",
        username, "/", "?fmt=mobileconfig&configType="
    ].join("");
    return uri;
};

ZmMobileDevicesPage.prototype._onClick = 
function(id) {

    var downloadType = "";
    if(id === ZmMobileDevicesPage.ID_DOWNLOAD_CONFIG) {
        var configType = this.getValue(ZmMobileDevicesPage.ID_CONFIG_TYPE);
        switch(configType) {
        case ZmMobileDevicesPage.DAV:
            downloadType = "dav";
            break;
        case ZmMobileDevicesPage.CALDAV:
            downloadType = "caldav";
            break;
        case ZmMobileDevicesPage.CARDDAV:
            downloadType = "carddav";
            break;
        case ZmMobileDevicesPage.IMAP:
            downloadType = "imap";
            break;
        default:
            downloadType = "all"
        }
        var link = this.parent._downloadUrl().concat(downloadType);
        window.open(link,"_parent");
    }
};

ZmMobileDevicesPage.prototype._mobileConfiguration = 
function(configDivId) {

    var params = {};
    var options = [
        { id: ZmMobileDevicesPage.ALL, value: ZmMobileDevicesPage.ALL, label: ZmMsg.mobileConfigurationAll },
        { id: ZmMobileDevicesPage.DAV, value: ZmMobileDevicesPage.DAV, label: ZmMsg.mobileConfigurationDav },
        { id: ZmMobileDevicesPage.CALDAV, value: ZmMobileDevicesPage.CALDAV, label: ZmMsg.mobileConfigurationCaldav },
        { id: ZmMobileDevicesPage.CARDDAV, value: ZmMobileDevicesPage.CARDDAV, label: ZmMsg.mobileConfigurationCarddav },
        { id: ZmMobileDevicesPage.IMAP, value: ZmMobileDevicesPage.IMAP, label: ZmMsg.mobileConfigurationImap }
    ];
    params.parent = this;
    params.template = "prefs.Pages#MobileConfig"
    params.form = {
        items: [
            { id: ZmMobileDevicesPage.ID_CONFIG_TYPE, type: "DwtSelect", items: options},
            { id: ZmMobileDevicesPage.ID_DOWNLOAD_CONFIG, type: "DwtButton", label: ZmMsg.mobileConFigurationDownloadLabel, onclick: this._onClick }
        ]
    };
    this._mobileConfig = new DwtForm(params);
    var mobileConfigDiv = document.getElementById(configDivId);
    mobileConfigDiv.appendChild(this._mobileConfig.getHtmlElement());
}

ZmMobileDeviceListView.prototype._getHeaderList =
function() {

	var headerList = [];
    if (this.type === ZmMobileDevice.TYPE_OAUTH) {
        headerList.push(new DwtListHeaderItem({field:ZmMobileDeviceListView.F_APP, text:ZmMsg.oAuthApp, width:ZmMsg.COLUMN_WIDTH_ID_MDL}));
        headerList.push(new DwtListHeaderItem({field:ZmMobileDeviceListView.F_APPDEVICE, text:ZmMsg.oAuthAppDevice, width:ZmMsg.COLUMN_WIDTH_ID_MDL}));
        headerList.push(new DwtListHeaderItem({field:ZmMobileDeviceListView.F_APPROVED, text:ZmMsg.oAuthAppApprovedDate, width:ZmMsg.COLUMN_WIDTH_STATUS_MDL}));
        headerList.push(new DwtListHeaderItem({field:ZmMobileDeviceListView.F_ACTIONS, width:ZmMsg.COLUMN_WIDTH_PROTOCOL_MDL}));
    }
    else {
        headerList.push(new DwtListHeaderItem({field: ZmMobileDeviceListView.F_DEVICE, text: ZmMsg.mobileDevice}));
        headerList.push(new DwtListHeaderItem({field: ZmMobileDeviceListView.F_ID, text: ZmMsg.mobileDeviceId, width: ZmMsg.COLUMN_WIDTH_ID_MDL}));
        headerList.push(new DwtListHeaderItem({field: ZmMobileDeviceListView.F_STATUS, text: ZmMsg.status, width: ZmMsg.COLUMN_WIDTH_STATUS_MDL}));
        headerList.push(new DwtListHeaderItem({field: ZmMobileDeviceListView.F_PROTOCOL, text: ZmMsg.mobileProtocolVersion, width: ZmMsg.COLUMN_WIDTH_PROTOCOL_MDL}));
        headerList.push(new DwtListHeaderItem({field: ZmMobileDeviceListView.F_PROVISIONABLE, text: ZmMsg.mobileProvisionable, width: ZmMsg.COLUMN_WIDTH_PROVISIONABLE_MDL}));
    }
    return headerList;
};

ZmMobileDeviceListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {

        if (field == ZmMobileDeviceListView.F_DEVICE) {
            html[idx++] = '<span style="white-space:nowrap">';
            html[idx++] = item.type;
            if (item.ua) {
                html[idx++] = " (";
                html[idx++] = item.ua;
                html[idx++] = ")";
            }
            html[idx++] = "</span>";
        } else if (field == ZmMobileDeviceListView.F_STATUS) {
            html[idx++] = item.getStatusString();
        } else if (field == ZmMobileDeviceListView.F_ID) {
            html[idx++] = item.id;
        } else if (field == ZmMobileDeviceListView.F_PROTOCOL) {
            html[idx++] = item.protocol;
        } else if (field == ZmMobileDeviceListView.F_PROVISIONABLE) {
            html[idx++] = item.provisionable ? AjxMsg.yes : AjxMsg.no;
        } else if (field == ZmMobileDeviceListView.F_APP) {
            html[idx++] = item.appName;
        } else if (field == ZmMobileDeviceListView.F_APPDEVICE) {
            html[idx++] = item.device;
        } else if (field == ZmMobileDeviceListView.F_APPROVED) {
            var approvedOn = item.approvedOn;
            html[idx++] = AjxDateFormat.getDateInstance(AjxDateFormat.MEDIUM).format(new Date(parseInt(approvedOn)));
        } else if (field == ZmMobileDeviceListView.F_ACTIONS) {
            html[idx++] = "<a href = 'javascript:;' onclick = 'ZmMobileDevicesController.handleRemoveOauthConsumerApp(this, " + '"' + item.accessToken + '", "' + item.appName + '", "' + item.device + '" ' + " );'>" + ZmMsg.remove + "</a> ";
        }

    return idx;
};
