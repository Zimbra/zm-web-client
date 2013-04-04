/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2012 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
(function() {
	tinymce.create('tinymce.plugins.QCTable', {
        init : function(ed, url) {
		   this.editor = ed;
           this.url = url;
           ed.addCommand('mceInsertQcTable', function() {
				//tinyMCE.activeEditor.windowManager.alert('Button was clicked.');
		   });
        },

        createControl: function(n, cm) {
            var t = this;
            switch (n) {
                case 'qctablebutton':

                    var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, is = tinymce.is;

                    var c = cm.createColorSplitButton('qctablebutton', {
                        title : 'Quick create tables',
                        image : t.url + '/img/example.gif',
                        cmd: 'mceInsertQcTable'
 				    });
					c.postRender = function() {
						var t = this, s = t.settings;

						if (s.onclick) {
							Event.add(t.id + '_action', 'click', function() {
								if (!t.isDisabled())
								s.onclick(t.value);
							});
						}

						Event.add(t.id + '_open', 'click', t.showMenu, t);
						Event.add(t.id + '_open', 'focus', function() {t._focused = 1;});
						Event.add(t.id + '_open', 'blur', function() {t._focused = 0;});

						// Old IE doesn't have hover on all elements
						if (tinymce.isIE6 || !DOM.boxModel) {
							Event.add(t.id, 'mouseover', function() {
								if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
								DOM.addClass(t.id, 'mceSplitButtonHover');
							});

							Event.add(t.id, 'mouseout', function() {
								if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
								DOM.removeClass(t.id, 'mceSplitButtonHover');
							});
						}
					}
					c.onShowMenu.add(function() {
						var pdiv = DOM.get(this.id + '_menu');
						var aTag = pdiv.getElementsByTagName('A');
						DOM.setStyle(aTag, 'backgroundColor', '#FFFFFF');
                        var tbsize = DOM.get('tbsize');
                        tbsize.innerHTML = "Table Size";
					});
					c.constructTable = function (xtr, ytd) {
						var tb = '<table cellspacing="0" cellpadding="3" align="center" border="1" style="border: 1px solid rgb(0, 0, 0); width: 90%; text-align: left; vertical-align: middle; border-collapse: collapse;">';
						for(var x = 0 ; x <= xtr ; x++ ) {
							tb = tb + "<tr>";
							for(var y = 0; y <= ytd ; y++) {
								tb = tb + "<td></br></td>";
							}
							tb = tb + "</tr>";
						}
						tb = tb + "</table>";
						ed = t.editor;
						ed.execCommand('mceInsertContent', false, tb);
					}
					c.renderMenu = function() {
									var t = this, m, i = 0, s = t.settings, n, tb, tr, w;

									w = DOM.add(s.menu_container, 'div', {id : t.id + '_menu', 'class' : s['menu_class'] + ' ' + s['class'], style : 'position:absolute;left:0;top:-1000px;'});
									m = DOM.add(w, 'div', {'class' : s['class'] + 'mceSplitButtonMenu'});
									DOM.add(m, 'span', {'class' : 'mceMenuLine'});

									n = DOM.add(m, 'table', {'class' : 'mceColorSplitMenu'});
									tb = DOM.add(n, 'tbody');

									tr = DOM.add(tb,'tr');
									td = DOM.add(tr,'td',{id : 'tbsize', rowspan : '1', colspan: '5', style : 'background-color:#9adffd;'});
									td.innerHTML = "Table Size";
									for(var i = 0; i < 5; i ++) {
										var tr = DOM.add(tb,'tr',{id:t.id+'_tr_'+i});
										for(var j = 0; j < 5; j++) {
											var td = DOM.add(tr, 'td');
											td = DOM.add(td, 'a', {
												id : t.id+'_a_'+ i +'_'+j,
												href : 'javascript:;',
												style : {
													backgroundColor : '#' + 'FFFFFF'
												},
												xtr : i,
												ytd : j
											});
										}
									}

									DOM.addClass(m, 'mceColorSplitMenu');

									Event.add(t.id + '_menu', 'mouseover', function(e) {
										e = e.target;
										if(e.nodeName == 'A' && (xtr = e.getAttribute('xtr')) && (ytd = e.getAttribute('ytd'))) {
											var tbsize = DOM.get('tbsize');
                                            tbsize.innerHTML = (parseInt(xtr) + 1) + ' x ' + (parseInt(ytd) + 1);
                                            for(var i = 0 ; i < 5 ; i++) {
												for(var j = 0 ; j < 5 ; j++) {
													if(i <= xtr && j <= ytd) {
														DOM.setStyle(t.id+'_a_'+ i +'_' + j, 'backgroundColor', "#FFF000");
													} else {
														DOM.setStyle(t.id+'_a_'+ i +'_' + j, 'backgroundColor', "#FFFFFF");
													}
												}
											}
										}
									});

									Event.add(t.id + '_menu', 'mousedown', function(e) {
										e = e.target;
										if (e.nodeName == 'A' && (xtr = e.getAttribute('xtr')) && (ytd = e.getAttribute('ytd'))) {
											t.constructTable(xtr, ytd);
										}
										return Event.cancel(e); // Prevent IE auto save warning
									});

									return w;

					}
		    		return c;
            }
            return null;
        },

		getInfo : function() {
			return {
				longname : 'QuickCreate Table Plugin',
				author : 'Zimbra Inc.,',
				authorurl : 'http://www.zimbra.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	tinymce.PluginManager.add('qctable', tinymce.plugins.QCTable);
})();