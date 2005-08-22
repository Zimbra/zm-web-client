/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmSplashScreen(shell, imageInfo, className) {

	if (arguments.length == 0) return;
	
	if (!(shell instanceof DwtShell)) {
		throw new AjxException("Parent must be a DwtShell", AjxException.INVALIDPARENT, "ZmSplashScreen");
	}
	
	className = className || "ZmSplashScreen";
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
	AjxImg.setImage(cell, imageInfo);
	
	this.getHtmlElement().appendChild(myTable);
    this.setBounds(0, 0, "100%", "100%")

	this.setCursor("wait");
}

ZmSplashScreen.prototype = new DwtControl;
ZmSplashScreen.prototype.constructor = ZmSplashScreen;
