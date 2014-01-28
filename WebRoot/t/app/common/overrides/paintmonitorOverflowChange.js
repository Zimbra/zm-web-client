Ext.define('ZCS.common.overrides.paintmonitorOverflowChange', {
    override: 'Ext.util.paintmonitor.OverflowChange',

    /**
     * Overridden to check if ZTPreventOverflowCheck is set
     */
    onElementPainted: function(e) {
        if (!ZCS.ZTPreventOverflowCheck) {
            this.getCallback().apply(this.getScope(), this.getArgs());
        }
    }

});