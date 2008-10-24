/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: Voicemail
 * 
 * Supports: The Voicemail application
 * 
 * Loaded:
 * 	- When the user goes to the Voicemail application
 * 	- If a search for voicemails returns results
 */

AjxPackage.require("ajax.util.AjxPluginDetector");

AjxPackage.require("ajax.dwt.core.DwtDragTracker");

AjxPackage.require("ajax.dwt.widgets.DwtBorderlessButton");
AjxPackage.require("ajax.dwt.widgets.DwtSlider");
AjxPackage.require("ajax.dwt.widgets.DwtSoundPlugin");

AjxPackage.require("zimbraMail.abook.model.ZmContact");

AjxPackage.require("zimbraMail.voicemail.model.ZmCallFeature");
AjxPackage.require("zimbraMail.voicemail.model.ZmPhone");
AjxPackage.require("zimbraMail.voicemail.model.ZmCallingParty");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceItem");
AjxPackage.require("zimbraMail.voicemail.model.ZmCall");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoicemail");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceFolder");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceFolderTree");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceList");

AjxPackage.require("zimbraMail.voicemail.view.ZmSoundPlayer");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmCallListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoicemailListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceTreeView");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoicePrefsView");

AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmCallListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoicemailListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceTreeController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoicePrefsController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceAccordionController");

