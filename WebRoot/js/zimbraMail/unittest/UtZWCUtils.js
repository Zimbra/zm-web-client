/**
 * Created by .
 * User: prajain
 * Date: 6/1/11
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */

UtZWCUtils = function() {};

UtZWCUtils.chooseApp = function(appId) {
    if (!appId) {return false;}

    var appChooser = appCtxt.getAppChooser();
    if (!appChooser) {return false;}

    var appButton = appChooser.getButton(appId);
    if (!appButton) {return false;}

    appButton._emulateSingleClick();
    return true;
};

UtZWCUtils.isCurrentViewByViewIds = function(viewIds) {
    //we return an object with the currentViewId because the currentViewId can be LOADING.
    //unit tests can decide to wait before the test is being declared failed.
    
    var ret = {isCurrentView:false, currentViewId:null};
    if (!viewIds || !viewIds.length) {return ret;}

    ret.currentViewId = appCtxt.getCurrentViewId();
    
    for (var i = 0; i < viewIds.length; i++) {
        var viewId = viewIds[i];
        if (ret.currentViewId == viewId) {
            ret.isCurrentViewId = true;
            break;
        }
    }
    console.debug("Expecting View: " + viewIds.toString() + " | Found view: " + ret.currentViewId);
    return ret;
};
//---------------
UtZWCUtils.isMailViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_TRAD, ZmId.VIEW_CONVLIST, ZmId.VIEW_CONVLIST2]);
};

UtZWCUtils.isAddressBookViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_CONTACT_SIMPLE]);
};

UtZWCUtils.isCalendarViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_CAL]);
};

UtZWCUtils.isTaskViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_TASKLIST]);
};

UtZWCUtils.isBriefCaseViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_BRIEFCASE_DETAIL]);
};

UtZWCUtils.isPreferencesViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_PREF]);
};
//---------------
UtZWCUtils.closeAllComposeViews = function() {
    var appChooser = appCtxt.getAppChooser();
    if (!appChooser) {return false;}

    var buttons = appChooser._buttons;
    for (var buttonId in buttons) {
        if (buttonId && buttonId.indexOf("tab_COMPOSE") > -1) {
            var appButton = appChooser.getButton(buttonId);
            if (appButton) {
                var id = appButton.getData(Dwt.KEY_ID);
                var idx = id.indexOf("COMPOSE");

                if (idx > -1) {
                    id = id.substring(idx);
                    var composeController = appCtxt.getAppViewMgr()._getViewController(id);
                    composeController._cancelListener();
                }
            }
        }
    }
};

UtZWCUtils.getComposeViewCount = function() {
    var ret = 0;
    var appChooser = appCtxt.getAppChooser();
    if (!appChooser) {return false;}

    var buttons = appChooser._buttons;
    for (var buttonId in buttons) {
        if (buttonId && buttonId.indexOf("tab_COMPOSE") > -1) {
            var appButton = appChooser.getButton(buttonId);
            if (appButton) {
                ret++;
            }
        }
    }

    return ret;
};

UtZWCUtils.getEmailAddressOfCurrentAccount = function() {
    var activeAccount = appCtxt.getActiveAccount();
    var email;
    if (activeAccount) {
        email = activeAccount.getEmail();
    }
    return email;
};

UtZWCUtils.getRandomString = function(length) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var randomString = '';
	for (var i=0; i<length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomString += chars.substring(rnum,rnum+1);
	}
	return randomString;
}


UtZWCUtils.LOAD_VIEW_SETTIMEOUT = 5000;
UtZWCUtils.MAX_STOP = 10000;