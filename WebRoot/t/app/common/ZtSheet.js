Ext.define('ZCS.common.ZtSheet', {
    override: 'Ext.Sheet',

    /**
     * Fixing bug in Sencha touch where a content editable div is not considered an input.
     *
     */
    beforeInitialize: function() {
        var me = this;
        // Temporary fix for a mysterious bug on iOS where double tapping on a sheet
        // being animated from the bottom shift the whole body up
        Ext.os.is.iOS && this.element.dom.addEventListener('touchstart', function(e) {

            var targetIsEditable = Ext.fly(e.target).getAttribute('contenteditable');

            if (!me.isInputRegex.test(e.target.tagName) && !targetIsEditable) {
                e.preventDefault();
            }
        }, true);
    }
});