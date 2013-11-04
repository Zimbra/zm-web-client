Ext.define('ZCS.common.overrides.sizemonitorOverflowChange', {
    override: 'Ext.util.sizemonitor.OverflowChange',

    /**
     * Additional check in these two methods to return
     * if ZTPreventOverflowCheck is set
     */
    onExpand: function(e) {
        if (ZCS.ZTPreventOverflowCheck || (Ext.browser.is.Webkit && e.horizontalOverflow && e.verticalOverflow)) {
            return;
        }

        Ext.TaskQueue.requestRead('refresh', this);
    },
    onShrink: function(e) {
        if (ZCS.ZTPreventOverflowCheck || (Ext.browser.is.Webkit && !e.horizontalOverflow && !e.verticalOverflow)) {
            return;
        }

        Ext.TaskQueue.requestRead('refresh', this);
    }

});