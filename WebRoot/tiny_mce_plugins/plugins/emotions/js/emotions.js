tinyMCEPopup.requireLangPack();

var EmotionsDialog = {
	addKeyboardNavigation: function(){
		var tableElm, cells, settings;
			
		cells = tinyMCEPopup.dom.select("a.emoticon_link", "emoticon_table");
			
		settings ={
			root: "emoticon_table",
			items: cells
		};
		cells[0].tabindex=0;
		tinyMCEPopup.dom.addClass(cells[0], "mceFocus");
		if (tinymce.isGecko) {
			cells[0].focus();		
		} else {
			setTimeout(function(){
				cells[0].focus();
			}, 100);
		}
		tinyMCEPopup.editor.windowManager.createInstance('tinymce.ui.KeyboardNavigation', settings, tinyMCEPopup.dom);
	}, 
	init : function(ed) {
		tinyMCEPopup.resizeToInnerSize();
		this.addKeyboardNavigation();
        this.addClickHandler(); //Only this line changed from default emotions.js
	},

	insert : function(file, title) {
		var ed = tinyMCEPopup.editor, dom = ed.dom;
		tinyMCEPopup.execCommand('mceInsertContent', false, dom.createHTML('img', {
			src : tinyMCEPopup.getWindowArg('plugin_url') + '/img/' + file,
            alt : ed.getLang(title),
			title : ed.getLang(title),
			border : 0
		}));

		tinyMCEPopup.close();
	},

    addClickHandler : function() {
        var tableElm = document.getElementById("emoticon_table"),
            onClickFunc,
            tinyMCEPopupDom = tinyMCEPopup.dom,
            events = tinyMCEPopupDom.events;

        if (tableElm) {
            onClickFunc = events.add(tableElm, 'click', function(ev) {
                var target = ev.target;
                if (target.nodeName === "TD" || target.nodeName === "A") {
                    target = tinyMCEPopupDom.select("img", target)[0];
                }
                if (target && target.nodeName === "IMG") {
                    tinyMCEPopup.execCommand('mceInsertContent', false, tinyMCEPopup.editor.dom.createHTML('img', {
                        src : target.src,
                        alt : target.alt,
                        title : target.alt,
                        border : 0
                    }));
                    events.remove(tableElm, 'click', onClickFunc);
                    tinyMCEPopup.close();
                }
            });
        }

    }
};

tinyMCEPopup.onInit.add(EmotionsDialog.init, EmotionsDialog);
