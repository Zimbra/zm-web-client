/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
/*
 * NewWindow, part 1
 * 
 * Special package to support actions in a new window. So far, there is
 * just composing a message and displaying a RFC attachment in a new window.
 * Everything that might be needed for those is in here: HTML editor,
 * contact picker (search, timezone, list view), msg view, attachments, etc.
 * 
 * NOTE: This package is not optimized at all - it contains everythings that
 * might possibly be needed in a new window.
 */
AjxPackage.require("ajax.core.AjxCore");
AjxPackage.require("ajax.debug.AjxDebug");
AjxPackage.require("ajax.util.AjxUtil");
AjxPackage.require("ajax.core.AjxException");
AjxPackage.require("ajax.util.AjxCookie");
AjxPackage.require("ajax.soap.AjxSoapException");
AjxPackage.require("ajax.soap.AjxSoapFault");
AjxPackage.require("ajax.soap.AjxSoapDoc");
AjxPackage.require("ajax.net.AjxRpcRequest");
AjxPackage.require("ajax.net.AjxRpc");
AjxPackage.require("ajax.net.AjxPost");
AjxPackage.require("ajax.util.AjxVector");
AjxPackage.require("ajax.util.AjxStringUtil");
AjxPackage.require("ajax.xml.AjxXmlDoc");
AjxPackage.require("ajax.core.AjxImg");
AjxPackage.require("ajax.core.AjxColor");
AjxPackage.require("ajax.events.AjxEvent");
AjxPackage.require("ajax.events.AjxEventMgr");
AjxPackage.require("ajax.util.AjxTimedAction");
AjxPackage.require("ajax.net.AjxInclude");
AjxPackage.require("ajax.events.AjxListener");
AjxPackage.require("ajax.util.AjxText");
AjxPackage.require("ajax.util.AjxEmailAddress");
AjxPackage.require("ajax.util.AjxTimezone");

AjxPackage.require("ajax.dwt.core.Dwt");
AjxPackage.require("ajax.dwt.core.DwtException");
AjxPackage.require("ajax.dwt.core.DwtDraggable");
AjxPackage.require("ajax.dwt.core.DwtDragTracker");

AjxPackage.require("ajax.dwt.graphics.DwtCssStyle");
AjxPackage.require("ajax.dwt.graphics.DwtPoint");
AjxPackage.require("ajax.dwt.graphics.DwtRectangle");

AjxPackage.require("ajax.dwt.events.DwtEvent");
AjxPackage.require("ajax.dwt.events.DwtEventManager");
AjxPackage.require("ajax.dwt.events.DwtUiEvent");
AjxPackage.require("ajax.dwt.events.DwtControlEvent");
AjxPackage.require("ajax.dwt.events.DwtFocusEvent");
AjxPackage.require("ajax.dwt.events.DwtKeyEvent");
AjxPackage.require("ajax.dwt.events.DwtMouseEvent");
AjxPackage.require("ajax.dwt.events.DwtMouseEventCapture");
AjxPackage.require("ajax.dwt.events.DwtListViewActionEvent");
AjxPackage.require("ajax.dwt.events.DwtSelectionEvent");
AjxPackage.require("ajax.dwt.events.DwtHtmlEditorStateEvent");
AjxPackage.require("ajax.dwt.events.DwtTreeEvent");
AjxPackage.require("ajax.dwt.events.DwtHoverEvent");
AjxPackage.require("ajax.dwt.events.DwtIdleTimer");

AjxPackage.require("ajax.dwt.keyboard.DwtKeyMap");

AjxPackage.require("ajax.dwt.widgets.DwtHoverMgr");
AjxPackage.require("ajax.dwt.widgets.DwtControl");
AjxPackage.require("ajax.dwt.widgets.DwtComposite");
AjxPackage.require("ajax.dwt.widgets.DwtShell");
AjxPackage.require("ajax.dwt.widgets.DwtLabel");
AjxPackage.require("ajax.dwt.widgets.DwtButton");
AjxPackage.require("ajax.dwt.widgets.DwtMenuItem");
AjxPackage.require("ajax.dwt.widgets.DwtMenu");
AjxPackage.require("ajax.dwt.widgets.DwtSelect");
AjxPackage.require("ajax.dwt.widgets.DwtListView");
AjxPackage.require("ajax.dwt.widgets.DwtInputField");
AjxPackage.require("ajax.dwt.widgets.DwtBaseDialog");
AjxPackage.require("ajax.dwt.widgets.DwtDialog");
AjxPackage.require("ajax.dwt.widgets.DwtMessageDialog");
AjxPackage.require("ajax.dwt.widgets.DwtToolBar");
AjxPackage.require("ajax.dwt.widgets.DwtToolTip");
AjxPackage.require("ajax.dwt.widgets.DwtText");
AjxPackage.require("ajax.dwt.widgets.DwtIframe");
AjxPackage.require("ajax.dwt.widgets.DwtGridSizePicker");
AjxPackage.require("ajax.dwt.widgets.DwtSpinner");
AjxPackage.require("ajax.dwt.widgets.DwtHtmlEditor");
AjxPackage.require("ajax.dwt.widgets.DwtColorPicker");
AjxPackage.require("ajax.dwt.widgets.DwtButtonColorPicker");
AjxPackage.require("ajax.dwt.widgets.DwtChooser");
AjxPackage.require("ajax.dwt.widgets.DwtPropertySheet");
AjxPackage.require("ajax.dwt.widgets.DwtPropertyPage");
AjxPackage.require("ajax.dwt.widgets.DwtTabView");
