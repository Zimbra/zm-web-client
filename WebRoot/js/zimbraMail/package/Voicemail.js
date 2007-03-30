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

AjxPackage.require("ajax.dwt.widgets.DwtSlider");
AjxPackage.require("ajax.dwt.widgets.DwtSoundPlugin");

AjxPackage.require("zimbraMail.voicemail.model.ZmPhone");
AjxPackage.require("zimbraMail.voicemail.model.ZmCallingParty");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceItem");
AjxPackage.require("zimbraMail.voicemail.model.ZmCall");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoicemail");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceFolder");
AjxPackage.require("zimbraMail.voicemail.model.ZmVoiceList");

AjxPackage.require("zimbraMail.voicemail.view.ZmSoundPlayer");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmCallListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoicemailListView");
AjxPackage.require("zimbraMail.voicemail.view.ZmVoiceTreeView");

AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmCallListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoicemailListController");
AjxPackage.require("zimbraMail.voicemail.controller.ZmVoiceTreeController");

