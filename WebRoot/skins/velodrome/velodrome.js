<script type="text/javascript" language="JavaScript">
function skin() {}

skin.hints = {
	app_chooser		: {	style:"tabs", 		direction:"LR",		fullWidth:true	},
	help_button		: {	style:"link", 		container:"quota",	hideIcon:true	},
	logout_button	: { style:"link", 		container:"quota",	hideIcon:true	}
}


/* PUBLIC API FOR SHOWING/HIDING PIECES OF THE SKIN */

skin.showSkin = function (state) {
	skin._showEl("skin_outer", state);
}
skin.hideSkin = function () {
	skin.showSkin(false);
}

skin.showFullScreen = function(state) {
	skin._showEl("skin_R_main", !state);
	skin._showEl("skin_R_main_full", state);	
}
skin.hideFullScreen = function() {
	skin.showFullScreen(false);
}


skin.showQuota = function (state) {
	skin._showEl("skin_td_quota_spacer", state);
	skin._showEl("skin_td_quota", state);
}
skin.hideQuota = function () {
	this.showQuota(false);
}

skin.showSearchBuilder = function (state) {
	skin._showEl("search_builder_outer", state);
	skin._showEl("skin_td_search_builder", state);
}
skin.hideSearchBuilder = function () {
	this.showSearchBuilder(false);
}

skin.showTopToolbar = function (state) {
	skin._showEl("skin_tr_top_toolbar", state);
}
skin.hideTopToolbar = function () {
	this.showTopToolbar(false);
}



skin.showTreeFooter = function (state) {
	skin._showEl("skin_tr_tree_footer", state);
}
skin.hideTreeFooter = function () {
	this.showTreeFooter(false);
}


skin.setTreeWidth = function(newWidth) {
	skin.setSize("skin_col_tree", newWidth, null);
}


skin.showTopAd = function (height) {
	skin._showEl("skin_top_ad_outer");
	if (height) {
		var el = skin.$("skin_top_ad_outer");
		el.style.height = height + "px";
	}
	skin._reflowApp();
}
skin.hideTopAd = function () {
	skin._hide("skin_top_ad_outer");
	skin._reflowApp();
}
skin.getTopAdContainer = function () {
	return skin.$("skin_container_top_ad");
}

skin.showSidebarAd = function (width) {
	var el = skin.$("skin_sidebar_ad_outer");
	el.style.display = 'block';
	var el = skin.$("skin_col_sidebar_ad");
	el.style.width = width + "px";
	var el = skin.$("skin_container_sidebar_ad");
	el.style.widdth = width + "px";
	skin._reflowApp();
}
skin.hideSidebarAd = function () {
	skin._hideEl("skin_sidebar_ad_outer");
	var el = skin.$("skin_col_sidebar_ad");
	el.style.width = "1px";
	var el = skin.$("skin_container_sidebar_ad");
	el.style.widdth = "1px";
	skin._reflowApp();
}

skin.getSidebarAdContainer = function() {
	return skin.$("skin_container_sidebar_ad");
}




skin.setSize = function(id, width, height) {
	var el = skin._getEl(id);
	if (width != null) el.style.width = width;
	if (height != null) el.style.height = height;
}

skin.$ = function(id) {
	return document.getElementById(id);
}
skin._getEl = function(id) {
	return document.getElementById(id);
}
skin._showEl = function(id, state) {
	var el = skin._getEl(id);
	var value;
	if (!el) return;
	if (state == false) {
		value = "none";
	} else {
		var tagName = el.tagName;
		if (tagName == "TD" && document.all == null)		value = "table-cell";
		else if (tagName == "TR" && document.all == null) 	value = "table-row";
		else value = "block";
	}
	el.style.display = value;
}
skin._hideEl = function(id, state) {
	skin._showEl(id, false);
}
skin._reflowApp = function () {
	var table = skin.$("skin_main_table");
	table.style.width = table.style.width;
	window._zimbraMail.getAppViewMgr().fitAll();
}

</script>
