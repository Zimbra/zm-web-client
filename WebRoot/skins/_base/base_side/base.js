skin = new BaseSkin({
    // specific components
    app_chooser		: {	style:"chiclet", 	direction:"TB"	},
	help_button		: {	style:"link", 		container:"app_chooser"	},
	logout_button	: { style:"link", 		container:"app_chooser"	},

    // skin regions
    searchBuilder: {    containers: [ "search_builder_outer", "skin_td_search_builder" ] }
});
