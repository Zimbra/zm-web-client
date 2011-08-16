/**
 * Section header provides a header to divide groups into sections.  The bar supports actions for click, mouseover,
 * mouseout, expand and collapse sections.
 * @param {ZmMailListGroup} group Group object
 * @param {objet} params hash of params for DwtControl
 */
ZmMailListSectionHeader= function(group, params) {
  var params = params || {} ;
  params.parent = params.parent || appCtxt.getShell();
  params.id = this.id = params.id || Dwt.getNextId();
  params.className = params.className || "groupHeader";
  DwtControl.call(this, params);
  this._group = group;
  this.setHtmlElementId(Dwt.getNextId(ZmMailListSectionHeader.HEADER_ID));
  this._createHtml(params);
  this._setEventHdlrs([DwtEvent.ONMOUSEDOWN]);
  this.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._groupHeaderMouseClick));

  this._collapsed = false;
};

ZmMailListSectionHeader.prototype = new DwtControl;
ZmMailListSectionHeader.prototype.constructor = ZmMailListSectionHeader;
ZmMailListSectionHeader.HEADER_ID = "GroupHeader_";

/**
 * returns HTML string of header
 * @return {String} html
 */
ZmMailListSectionHeader.prototype.getHeaderHtml =
function() {
    return this._el.innerHTML;
};


ZmMailListSectionHeader.prototype._createHtml =
function(params) {
	this._el = this.getHtmlElement();
	this._el.innerHTML = this._renderGroupHdr(params.headerTitle);
};

ZmMailListSectionHeader.prototype._renderGroupHdr =
function(headerTitle) {
    var id = this._el.id;
    var htmlArr = [];
    var idx = 0;
    var nodeIdStr = "id='" + id + "_imgNode'";
    htmlArr[idx++] = "<div id='" + id +"'>";
    htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100% class='DwtListView-Column'><tr><td>";
    htmlArr[idx++] =  AjxImg.getImageHtml("NodeExpanded", "float:left;", nodeIdStr);
	htmlArr[idx++] = "<div class='DwtListHeaderItem-label black' style='padding:0px 0px 2px 2px; font-weight:bold; float:left;' id='" + id + "_groupTitle'>";
    htmlArr[idx++] = headerTitle;
    htmlArr[idx++] = "</div>";
    htmlArr[idx++] = "</td></tr></table>"
	htmlArr[idx++] = "</div>";
    return htmlArr.join("");
};

ZmMailListSectionHeader.prototype._groupHeaderMouseClick =
function(ev) {
   if (ev && ev.button == DwtMouseEvent.RIGHT) {
       this._actionMenuListener(ev);
   }
   else {
       if (!this._collapsed) {
           this._doCollapse(ev);
       }
       else {
           this._doExpand(ev);
       }
   }
};

ZmMailListSectionHeader.prototype._doCollapse =
function(ev) {
    var p = document.getElementById(this._el.id);
    while (p) {
        var ns = p.nextSibling;
        if (ns && ns.id.indexOf(ZmMailListSectionHeader.HEADER_ID) == -1) {
            Dwt.setVisible(ns, false);
        }
        else{
            this._setImage(this._el.id + "_imgNode", "NodeCollapsed");
            this._collapsed = true;
            return;
        }
        p = ns;
    }
};

ZmMailListSectionHeader.prototype._doExpand =
function(ev) {
    var p = document.getElementById(this._el.id);
    while (p) {
        var ns = p.nextSibling;
        if (ns && ns.id.indexOf(ZmMailListSectionHeader.HEADER_ID) == -1) {
            Dwt.setVisible(ns, true);
        }
        else {
            this._setImage(this._el.id + "_imgNode", "NodeExpanded");
            this._collapsed = false;
            return;
        }
        p = ns;
    }
};

ZmMailListSectionHeader.prototype._collapseAll =
function(ev) {
  if (this._group) {
      var headers = this._group.getAllSectionHeaders();
      for (var i=0; i<headers.length; i++) {
          headers[i]._doCollapse(ev);
      }
  }
};

ZmMailListSectionHeader.prototype._expandAll =
function(ev) {
  if (this._group) {
      var headers = this._group.getAllSectionHeaders();
      for (var i=0; i<headers.length; i++) {
          headers[i]._doExpand(ev);
      }
  }
};

ZmMailListSectionHeader.prototype._setImage =
function(imgId, imgInfo) {
    var imgNode = document.getElementById(imgId);
    if (imgNode && imgNode.parentNode) {
        AjxImg.setImage(imgNode.parentNode, imgInfo);
    }
};

ZmMailListSectionHeader.prototype._actionMenuListener =
function(ev) {
	if (!this._menu) {
		var menu = new ZmPopupMenu(this);
		var collapseListener = new AjxListener(this, this._collapseAll);
		var expandListener = new AjxListener(this, this._expandAll);
		var mi = menu.createMenuItem("collapse_all", {text:ZmMsg.collapseAllGroups, style:DwtMenuItem.NO_STYLE});
		mi.addSelectionListener(collapseListener);
		mi = menu.createMenuItem("expand_all", {text:ZmMsg.expandAllGroups, style:DwtMenuItem.NO_STYLE});
		mi.addSelectionListener(expandListener);
		this._menu = menu;
	}
    this._menu.popup(0, ev.docX, ev.docY);
};
