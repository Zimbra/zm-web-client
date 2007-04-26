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
