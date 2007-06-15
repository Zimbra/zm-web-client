//
// Skin class
//

function SteelSkin() {
    BaseSkin.call(this, {
        // specific components
        app_chooser		: {	style:"chiclet", 	direction:"TB"	},
        help_button		: {	style:"link", 		container:"app_chooser"	},
        logout_button	: { style:"link", 		container:"app_chooser"	},
        // skin regions
        fullScreen: { containers: [ "skin_tr_outer_main_full", "!skin_tr_outer_main" ] }
    });
}
SteelSkin.prototype = new BaseSkin;
SteelSkin.prototype.constructor = SteelSkin;

//
// Constants
//

SteelSkin.FULLSCREEN = [
    { componentId: "skin_container_app_top_toolbar",
      containerId: { true: "skin_app_top_toolbar_full", false: "skin_app_top_toolbar" }
    },
    { componentId: "skin_container_app_chooser",
      containerId: { true: "skin_td_app_chooser_full", false: "skin_td_app_chooser" }
    }
];

//
// Protected methods
//

SteelSkin.prototype._showFullScreen = function(state) {
    // re-position containers
    for (var i = 0; i < SteelSkin.FULLSCREEN.length; i++) {
        var data = SteelSkin.FULLSCREEN[i];
        var componentId = data.componentId;
        var containerId = data.containerId[state == null || state];
        this._reparentEl(componentId, containerId);
    }
};

//
// Skin instance
//

skin = new SteelSkin();
