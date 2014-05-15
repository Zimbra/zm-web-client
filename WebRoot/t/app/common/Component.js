Ext.define('ZCS.common.Component', {
    override: 'Ext.Component',

    show: function (animation) {

        //turn off animation for show() and hide() on Android devices since
        // Messagebox gets stuck on some OS versions - see Bug 89639 for details
        if (Ext.os.is.Android) {
            return this.callParent([false]);
        } else {
            return this.callParent(arguments);
        }
    },
    hide: function (animation) {
        if (Ext.os.is.Android) {
            return this.callParent([false]);
        } else {
            return this.callParent(arguments);
        }
    }
});