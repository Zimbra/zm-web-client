AjxTemplate.register("share.Widgets#ZmAppChooserButton", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_select' class='ZWidgetTable  ZWidgetBorder ZAppTabBorder' cellspacing=0 cellpadding=0><tr><td style='width:5px'><div class='ImgAppTab_L'></div></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_left_icon'  	class='ImgAppTab ZLeftIcon ZWidgetIcon'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_title'		class='ImgAppTab ZWidgetTitle'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_right_icon' 	class='ImgAppTab ZRightIcon ZWidgetIcon'></td><td style='width:5px'><div class='ImgAppTab_R'></div></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"class": "ZAppTab",
	"id": "share.Widgets#ZmAppChooserButton"
}, true);
AjxTemplate.register("share.Widgets", AjxTemplate.getTemplate("share.Widgets#ZmAppChooserButton"), AjxTemplate.getParams("share.Widgets#ZmAppChooserButton"));

AjxTemplate.register("share.App#UserInfo", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<a href='javascript:;' onclick='";
	buffer[_i++] = data["staticFunc"];
	buffer[_i++] = "'>";
	buffer[_i++] = data["lbl"];
	buffer[_i++] = "</a>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "share.App#UserInfo"
}, true);

AjxTemplate.register("dwt.Widgets#ZTabBar", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table border=0 cellpadding=0 cellspacing=0 width=100%><tr valign='bottom' id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_items'>";
	buffer[_i++] =  AjxTemplate.expand("#ZTabBarPrefix", data) ;
	buffer[_i++] =  AjxTemplate.expand("#ZTabBarSuffix", data) ;
	buffer[_i++] = "</tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"class": "ZWidget",
	"id": "dwt.Widgets#ZTabBar"
}, true);

AjxTemplate.register("dwt.Widgets#ZTabBarPrefix", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "dwt.Widgets#ZTabBarPrefix"
}, true);

AjxTemplate.register("dwt.Widgets#ZTabBarSuffix", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "dwt.Widgets#ZTabBarSuffix"
}, true);

AjxTemplate.register("share.Widgets#ZmSearchToolBar", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<table border=0 cellpadding=0 cellspacing=0 width='100%' height='100%'><tr><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_inputField' width='100%' class='ZmSearchToolbarCell'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_searchMenuButton' class='ZmSearchToolbarCell'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_searchButton' hint='text' class='ZmSearchToolbarCell ZSearchButtonCell'></td><!-- UNCOMMENT THIS IF YOU WANT CUSTOM SEARCH TO APPEAR AS A SEPARATE BUTTON ON SEARCH TOOLBAR\n";
	buffer[_i++] = "			<td class='ZmSearchToolbarSeparatorCell'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_customSearchButtonSep' class='vertSep' style='display:none'></div></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_customSearchButton' class='ZmSearchToolbarCell'></td>\n";
	buffer[_i++] = "			--><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_saveButton' hint='text' class='ZmSearchToolbarCell ZmSearchLink'></td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_advancedButton' hint='text' class='ZmSearchToolbarCell ZmSearchLink'></td></tr></table>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"id": "share.Widgets#ZmSearchToolBar"
}, true);

AjxTemplate.register("dwt.Widgets#DwtBaseDialog", 
function(name, params, data, buffer) {
	var _hasBuffer = Boolean(buffer);
	data = (typeof data == "string" ? { id: data } : data) || {};
	buffer = buffer || [];
	var _i = buffer.length;

	buffer[_i++] = "<div class='DwtDialog'><table cellspacing=0 cellpadding=0><tr id='";
	buffer[_i++] = data["dragId"];
	buffer[_i++] = "'><td class='minWidth'><div class='Dialog_NW'></div></td><td class='minWidth' class='Dialog_N'>";
	buffer[_i++] = data["icon"];
	buffer[_i++] = "</td><td id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_title' class='Dialog_N DwtDialogTitle'>";
	buffer[_i++] = data["title"];
	buffer[_i++] = "</td><td class='minWidth' class='Dialog_N'><div class='";
	buffer[_i++] = data["closeIcon2"];
	buffer[_i++] = "'></div></td><td class='minWidth' class='Dialog_N'><div class='";
	buffer[_i++] = data["closeIcon1"];
	buffer[_i++] = "'></div></td><td class='minWidth'><div class='Dialog_NE'></div></td></tr><tr><td class='Dialog_W'><div></div></td><td class='DialogBody' colspan='4'><div id='";
	buffer[_i++] = data["id"];
	buffer[_i++] = "_content' class='DwtDialogBody'></div>";
	 if (data.controlsTemplateId) { 
	buffer[_i++] =  AjxTemplate.expand(data.controlsTemplateId, data) ;
	 } 
	buffer[_i++] = "</td><td class='Dialog_E'><div></div></td></tr><tr><td class='minWidth'><div class='Dialog_SW'></div></td><td colspan='4' class='Dialog_S'><div></div></td><td class='minWidth'><div class='Dialog_SE'></div></td></tr></table></div>";

	return _hasBuffer ? buffer.length : buffer.join("");
},
{
	"width": "20",
	"height": "32",
	"id": "dwt.Widgets#DwtBaseDialog"
}, true);

