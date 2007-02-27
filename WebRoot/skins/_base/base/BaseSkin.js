function BaseSkin(hints) {
    ZmSkin.call(this, ZmSkin.merge(hints, {
        // specific components
        app_chooser:    { style: "tabs", direction: "LR" },
        help_button:    { style: "link", container: "quota" },
        logout_button:  { style: "link", container: "quota" },

        // skin regions
        skin:           { containers: "skin_outer" },
        quota:          { containers: [ "skin_td_quota_spacer", "skin_td_quota" ] },
        searchBuilder:  { containers: [ "search_builder_outer", "skin_td_search_builder" ] },
        topToolbar:     { containers: [ "skin_tr_top_toolbar", "!skin_tr_top_toolbar_shim" ] },
        bottomToolbar:  { containers: [ "skin_tr_bottom_toolbar", "!skin_tr_bottom_toolbar_shim" ] },
        treeFooter:     { containers: [ "skin_tr_tree_footer_sep", "skin_tr_tree_footer"] },
        fullScreen:     { containers: [ "skin_tr_main_full", "!skin_tr_main", "!skin_tr_status" ] }
    }));    
}
BaseSkin.prototype = new ZmSkin;
BaseSkin.prototype.constructor = BaseSkin;

