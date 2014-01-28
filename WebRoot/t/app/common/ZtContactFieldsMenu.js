Ext.define('ZCS.common.ZtContactFieldsMenu', {
    extend: 'ZCS.common.ZtMenu',

    initialize: function(){
        this.callParent(arguments);
        this.setPositioning('tc-bc?');
    }
});