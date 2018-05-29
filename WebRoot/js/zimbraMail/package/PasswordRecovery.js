/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2015, 2016 Synacor, Inc. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK *****
 */
/**
 * Created by administrator on 04/05/15.
 */

AjxPackage.require("ajax.core.AjxException");

AjxPackage.require("ajax.events.AjxEventMgr");
AjxPackage.require("ajax.events.AjxListener");

AjxPackage.require("ajax.dwt.graphics.DwtPoint");
AjxPackage.require("ajax.dwt.graphics.DwtCssStyle");

AjxPackage.require("ajax.util.AjxUtil");
AjxPackage.require("ajax.util.AjxText");
AjxPackage.require("ajax.util.AjxVector");
AjxPackage.require("ajax.util.AjxStringUtil");
AjxPackage.require("ajax.util.AjxTimedAction");

AjxPackage.require("ajax.dwt.core.Dwt");
AjxPackage.require("ajax.dwt.core.DwtDraggable");

AjxPackage.require("ajax.dwt.events.DwtEvent");
AjxPackage.require("ajax.dwt.events.DwtControlEvent");
AjxPackage.require("ajax.dwt.events.DwtUiEvent");
AjxPackage.require("ajax.dwt.events.DwtControlEvent");
AjxPackage.require("ajax.dwt.events.DwtFocusEvent");
AjxPackage.require("ajax.dwt.events.DwtKeyEvent");
AjxPackage.require("ajax.dwt.events.DwtMouseEvent");
AjxPackage.require("ajax.dwt.events.DwtSelectionEvent");
AjxPackage.require("ajax.dwt.events.DwtTreeEvent");
AjxPackage.require("ajax.dwt.events.DwtMouseEventCapture");
AjxPackage.require("ajax.dwt.events.DwtEventManager");
AjxPackage.require("ajax.dwt.events.DwtHoverEvent");

AjxPackage.require("ajax.dwt.widgets.DwtControl");
AjxPackage.require("ajax.dwt.widgets.DwtComposite");
AjxPackage.require("ajax.dwt.widgets.DwtBaseDialog");
AjxPackage.require("ajax.dwt.widgets.DwtDialog");
AjxPackage.require("ajax.dwt.widgets.DwtToolTip");
AjxPackage.require("ajax.dwt.widgets.DwtHoverMgr");
AjxPackage.require("ajax.dwt.widgets.DwtLabel");
AjxPackage.require("ajax.dwt.widgets.DwtButton");
AjxPackage.require("ajax.dwt.widgets.DwtComposite");
AjxPackage.require("ajax.dwt.widgets.DwtMenu");
AjxPackage.require("ajax.dwt.widgets.DwtShell");

AjxPackage.require("ajax.dwt.keyboard.DwtTabGroupEvent");
AjxPackage.require("ajax.dwt.keyboard.DwtTabGroup");
AjxPackage.require("ajax.dwt.keyboard.DwtKeyboardMgr");

AjxPackage.require("ajax.soap.AjxSoapDoc");
AjxPackage.require("ajax.soap.AjxSoapException");

AjxPackage.require("ajax.net.AjxRpc");
AjxPackage.require("ajax.net.AjxRpcRequest");

AjxPackage.require("ajax.debug.AjxDebug");

AjxPackage.require("ajax.xml.AjxXmlDoc");

AjxPackage.require("zimbra.csfe.ZmCsfeCommand");
AjxPackage.require("zimbra.csfe.ZmCsfeException");
AjxPackage.require("zimbra.csfe.ZmCsfeResult");

AjxPackage.require("zimbraMail.share.view.dialog.ZmPasswordRecoveryDialog");
