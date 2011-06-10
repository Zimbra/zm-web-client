/**
 * Created by .
 * User: prajain
 * Date: 6/1/11
 * Time: 2:08 PM
 * To change this template use File | Settings | File Templates.
 */


ZmUnitTestManager.module("Calendar", null, ["Calendar"]);

ZmUnitTestManager.test("Show Calendar view",
    function() {
        console.debug("starting calendar test");

        UtZWCUtils.chooseApp(ZmApp.CALENDAR);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                console.debug("continuing calendar test");
                var isRightView = UtZWCUtils.isCalendarViewCurrent();
                UT.ok(isRightView, "Calendar view loaded");
                UT.start();
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);
