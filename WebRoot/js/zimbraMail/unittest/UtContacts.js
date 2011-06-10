/**
 * Created by .
 * User: prajain
 * Date: 6/1/11
 * Time: 1:34 PM
 * To change this template use File | Settings | File Templates.
 */


ZmUnitTestManager.module("Contacts", null, ["Contacts"]);

ZmUnitTestManager.test("Show Contacts view",
    function() {
        console.debug("starting contacts test");

        UtZWCUtils.chooseApp(ZmApp.CONTACTS);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                console.debug("continuing contacts test");
                var isRightView = UtZWCUtils.isAddressBookViewCurrent();
                UT.ok(isRightView,"Contacts view loaded");
                UT.start();
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);

ZmUnitTestManager.test("Add new contact",
    function() {
        var zmContactsApp = appCtxt.getApp(ZmApp.CONTACTS)
        zmContactsApp._handleLoadNewItem();
    }
);