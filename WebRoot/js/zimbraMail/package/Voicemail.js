/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
AjxPackage.require("zimbraMail.voicemail.view.ZmFlashAudioPlayer");

AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmCallListView");

AjxPackage.require("zimbraMail.voicemail.view.ZmVoicemailListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmMP3VoicemailListView");

AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceOverviewContainer");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceTreeView");
AjxPackage.require("zimbraMail.voicemail.view.ZmMP3VoicemailListView");

AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmCallListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoicemailListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceTreeController");

