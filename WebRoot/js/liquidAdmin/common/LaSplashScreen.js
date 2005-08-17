function LaSplashScreen(shell, imageInfo, className) {

	if (arguments.length == 0) return;
	
	if (!(shell instanceof DwtShell)) {
		throw new LsException("Parent must be a DwtShell", LsException.INVALIDPARENT, "LaSplashScreen");
	}
	
	className = className || "LaSplashScreen";
	DwtControl.call(this, shell, className, Dwt.ABSOLUTE_STYLE);

	this.setZIndex(Dwt.Z_SPLASH);
	
	var myTable = this.getDocument().createElement("table");
	myTable.border = 0;
	myTable.cellSpacing = 0;
	myTable.cellPadding = 0;
	Dwt.setSize(myTable, "100%", "100%");
	
	var row = myTable.insertRow(0);
	var cell = row.insertCell(0);
	cell.vAlign = "middle";
	cell.align = "center";
	LsImg.setImage(cell, imageInfo);
	
	this.getHtmlElement().appendChild(myTable);
    this.setBounds(0, 0, "100%", "100%")

	this.setCursor("wait");
}

LaSplashScreen.prototype = new DwtControl;
LaSplashScreen.prototype.constructor = LaSplashScreen;
