/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite, Network Edition.
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.  All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK *****
 */
//
// Skin class
//
function VelodromeSkin() {
    BaseSkin.call(this, {
        // specific components
        appChooser		: {	direction:"LR",		fullWidth:true	},
        helpButton		: {	style:"link", 		container:"quota",	hideIcon:true,	url: "http://www.comcast.net/help/faq/index.jsp?cat=Email#SmartZone"	},
        logoutButton	: { style:"link", 		container:"quota",	hideIcon:true	},
        // skin regions
        quota:          { containers: [ "skin_td_quota" ] },
        userInfo: { position: "static" },
        sidebarAd:	  {
            containers: function(skin, state) {
                skin._showEl("skin_sidebar_ad_outer", state);
                skin._reflowApp();
            }
        },
        fullScreen:	 { containers: [ "skin_tr_main_full", "!skin_tr_main","!skin_td_tree_outer", "!skin_td_tree_app_sash"] },
        searchBuilder:  { containers: [ "skin_tr_search_builder_toolbar",
										"skin_tr_search_builder",
										"skin_td_search_builder_toolbar",
										"skin_td_search_builder",
        							] },
        treeFooter:     { containers: [ "skin_tr_tree_footer", 
        								"skin_td_tree_footer",
        								"skin_container_tree_footer"
        							] },
		myCardSupport:	true
    });
}
VelodromeSkin.prototype = new BaseSkin;
VelodromeSkin.prototype.constructor = VelodromeSkin;

//
// Public methods
//

VelodromeSkin.prototype.show = function(id, visible) {
    ZmFolder.HIDE_ID[ZmFolder.ID_AUTO_ADDED] = true;

    BaseSkin.prototype.show.apply(this, arguments);

    if (id == "fullScreen") {
        // true, if unspecified
        visible = visible == null || visible;

        // swap toolbar containers
        var parentId = visible ? "skin_full_toolbar_container" : "skin_main_toolbar_container";
        var parentEl = document.getElementById(parentId);

        var toolbarId = "skin_container_app_top_toolbar";
        var toolbarEl = document.getElementById(toolbarId);

        parentEl.appendChild(toolbarEl);
    }
};

VelodromeSkin.prototype.getSidebarAdContainer = function() {
        return document.getElementById("skin_container_sidebar_ad");
};

//
// Skin instance
//

skin = new VelodromeSkin();

//
// App listeners
//

skin.__handleMailLaunch = function() {
	appCtxt.set(ZmSetting.SEND_ON_BEHALF_OF, true)
};

ZmZimbraMail.addAppListener(ZmApp.MAIL, ZmAppEvent.PRE_LAUNCH, new AjxListener(skin, skin.__handleMailLaunch));
//
// utility methods
//

VelodromeSkin.prototype.overrideAPI = function(object, funcname, newfunc) {
	newfunc = newfunc || this[funcname];
	if (newfunc) {
		newfunc.func = object[funcname]; // saves reference to old func
		object[funcname] = newfunc;
	}
};
