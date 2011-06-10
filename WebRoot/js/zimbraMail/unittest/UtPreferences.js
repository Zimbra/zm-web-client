/**
 * Created by .
 * User: prajain
 * Date: 6/1/11
 * Time: 1:03 PM
 * To change this template use File | Settings | File Templates.
 */


ZmUnitTestManager.module("Preferences", null, ["Preferences"]);

ZmUnitTestManager.test("Show preferences view",
    function() {
        console.debug("starting preferences test");

        UtZWCUtils.chooseApp(ZmApp.PREFERENCES);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                console.debug("continuing preferences test");
                UT.start();
                var isRightView = UtZWCUtils.isPreferencesViewCurrent();
                UT.ok(isRightView,"Preferences view loaded");
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);
