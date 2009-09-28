/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite, Network Edition.
 * Copyright (C) 2009 Zimbra, Inc.  All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK *****
 */
//
// Application launch methods
//

VelodromeSkin.prototype._noImportExport_handlePrefsPreLaunch = function() {
	var prefId = "IMPORT_FOLDER";
	var section = ZmPref.getPrefSectionWithPref(prefId);
	ZmPref.unregisterPrefSection(section && section.id);
};

// register app listeners

ZmZimbraMail.addAppListener(
	ZmApp.PREFERENCES, ZmAppEvent.PRE_LAUNCH, new AjxListener(skin, skin._noImportExport_handlePrefsPreLaunch)
);
