/*
 * Package: Share
 * 
 * Supports: 
 * 	- Sharing folders with other users
 * 	- Handling links/mountpoints
 * 
 * Loaded:
 * 	- When share or mountpoint data arrives in a <refresh> block
 * 	- When user creates a share
 */
AjxPackage.require("zimbraMail.share.model.ZmShare");
AjxPackage.require("zimbraMail.share.model.ZmMountpoint");

AjxPackage.require("zimbraMail.share.view.ZmShareReply");

AjxPackage.require("zimbraMail.share.view.dialog.ZmAcceptShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmDeclineShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmLinkPropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmSharePropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRevokeShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmMountFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFindnReplaceDialog");