Test = function() {
	this.shell = new DwtShell({className:"MainShell"});

// 	this.shell._setMouseEventHdlrs();
// 	this.shell.addListener(DwtEvent.ONMOUSEMOVE, new AjxListener(this, this.func));

// 	var f1 = new ZmSpreadSheet(this.shell, null, "absolute");
// 	f1.setModel(new ZmSpreadSheetModel(20, 8));
// 	new ZmSpreadSheetToolbars(f1, f1);
//  	f1.setBounds(20, 20, 800, 300);
// 	f1.setZIndex(Dwt.Z_VIEW);

	try {

		var container = new DwtComposite(this.shell, "", "absolute");

		var b = new DwtButton({parent:container, style:0});
		b.setText("Insert Spreadsheet");
		b.setSize(100, null);

		var editor = new DwtHtmlEditor({parent:container, className:"ZmHtmlEditor",
					       content:"<h1>Check This Out</h1><p>paragraph</p>",
					       mode:DwtHtmlEditor.HTML, blankIframeSrc:"/public/blank.html"});

		container.setLocation(20, 20);
		editor.setSize(800, 600);

		var HAS_EVENTS = false;
		b.addSelectionListener(function() {
			var doc = editor._getIframeDoc();

			if (AjxEnv.isGeckoBased && !HAS_EVENTS) {
				HAS_EVENTS = true;
				doc.addEventListener("blur", function() {
					editor._getIframeDoc().designMode = "off";
				}, true);
				doc.addEventListener("focus", function() {
					editor._getIframeDoc().designMode = "on";
				}, true);
			}

			editor.focus();
			if (AjxEnv.isGeckoBased)
				doc.designMode = "off";
			var ifr = doc.createElement("iframe");
            ifr.src = location.protocol + "//" + location.hostname + ((location.port == '80')? "" : ":" +location.port) + "/public/Spreadsheet.jsp";
			ifr.style.width = "100%";
			ifr.style.height = "400px";
			editor._insertNodeAtSelection(ifr);
		});

		container.setZIndex(Dwt.Z_VIEW);

	} catch(ex) {
		alert(ex.dump());
	}
};

Test.run = function() {
	new Test();
};
