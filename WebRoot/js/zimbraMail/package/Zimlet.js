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
 * Package: Zimlet
 * 
 * Supports: Zimlet instantiation and use
 * 
 * Loaded: When zimlets arrive in the <refresh> block
 */
AjxPackage.require("ajax.util.AjxSHA1");

AjxPackage.require("ajax.xslt.AjxXslt");

AjxPackage.require("zimbraMail.share.model.ZmZimletBase");
AjxPackage.require("zimbraMail.share.model.ZmZimletContext");
AjxPackage.require("zimbraMail.share.model.ZmZimletMgr");
AjxPackage.require("zimbraMail.share.model.ZmZimlet");

AjxPackage.require("zimbraMail.share.controller.ZmZimletTreeController");
