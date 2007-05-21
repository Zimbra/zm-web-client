DBG = new AjxDebug(AjxDebug.NONE, null, false);

var shell = null;
var spreadSheet = null;
var model = null;

create = function(data) {
	shell = new DwtShell({className:"MainShell"});
	shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));
	spreadSheet = new ZmSpreadSheet(shell, null, "absolute");
	if (data != null) {
		model = new ZmSpreadSheetModel(0, 0);
		model.deserialize(data);
	} else {
		model = new ZmSpreadSheetModel(10, 6);
	}
	spreadSheet.setModel(model);
	new ZmSpreadSheetToolbars(spreadSheet, spreadSheet);
	spreadSheet.setZIndex(Dwt.Z_VIEW);
	window.onresize = _resize;
	_resize();
	spreadSheet._selectedCell = null;
	spreadSheet.focus();
};

_resize = function() {
	spreadSheet.setDisplay("none");
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	if (!AjxEnv.isIE) {
		w -= 2;
		h -= 2;
	}
	spreadSheet.setDisplay("block");
	spreadSheet.setBounds(0, 0, w, h);
};

serialize = function() {
	return model.serialize();
};

deserialize = function(data) {
	model = new ZmSpreadSheetModel(0, 0);
	model.deserialize(data);
	spreadSheet.setModel(model);
};

getHTML = function() {
	return model.getHtml();
};

getHeadHTML = function() {
	return [ "<style type='text/css'>",
		 "td.SpreadSheet-Type-number { text-align: right; }",
		 "td.SpreadSheet-Type-currency { text-align: right; }",
		 "td.SpreadSheet-Type-error { text-align: center; color: #f00; }",
		 "</style>" ].join("");
};

// Useful for testing the spreadsheet outside the ACE framework
window.onload = function() {
	setTimeout(function() {
		if (!window.ZmACE)
			create();
	}, 200);
};
