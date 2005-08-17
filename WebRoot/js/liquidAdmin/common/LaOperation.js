/**
* @class LaOperation
* @contructor
* simplified version of LmOperation
* This class encapsulates the properties of an action that can be taken on some item: image, caption, description, LsListener
* @param caption string
* @param tt string
* @param img string path to image
* @param lsnr LsListener
**/

function LaOperation(id, caption, tooltip, imgId, disImgId, lsnr) {
	this.id = id;
	this.caption = caption;
	this.tt = tooltip;
	this.listener = lsnr;
	this.imageId = imgId;
	this.disImageId = disImgId;
}

LaOperation.prototype.toString = 
function() {
		return "LaOperation";
}

// Operations
LaOperation.NONE = -2;		// no operations or menu items
LaOperation.SEP = -1;		// separator
LaOperation.NEW = 1;
LaOperation.DELETE = 2;
LaOperation.REFRESH = 3;
LaOperation.EDIT = 4;
LaOperation.CHNG_PWD = 5;
LaOperation.CLOSE = 6;
LaOperation.SAVE = 7;
LaOperation.NEW_WIZARD = 8;
LaOperation.PAGE_FORWARD = 9;
LaOperation.PAGE_BACK = 10;
LaOperation.DUPLICATE = 11;
LaOperation.GAL_WIZARD = 12;
LaOperation.AUTH_WIZARD =13;
LaOperation.VIEW_MAIL =14;
LaOperation.MAIL_RESTORE = 15;