/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
(function() {
	tinymce.create('tinymce.plugins.ZTablePlugin', {
        init : function(ed, url) {
            var t = this;
			t.editor = ed;
			t.url = url;
            
            ed.onNodeChange.add(function(ed, cm, n) {
				var t = this;
                var p = ed.dom.getParent(n, 'td,th,caption');

                if (p && p.nodeName === 'CAPTION')
					p = null;

                var ztab = cm.get("ztablemenu");
                if(ztab.ztmenu['row_props']) {
                  ztab.ztmenu['row_props'].setDisabled(!p);      
                }
                if(ztab.ztmenu['cell_props']) {
                  ztab.ztmenu['cell_props'].setDisabled(!p);
                }
                if(ztab.ztmenu['row_before']) {
                  ztab.ztmenu['row_before'].setDisabled(!p);
                }
                if(ztab.ztmenu['row_after']) {
                  ztab.ztmenu['row_after'].setDisabled(!p);
                }
                if(ztab.ztmenu['delete_row']) {
                  ztab.ztmenu['delete_row'].setDisabled(!p);
                }
                if(ztab.ztmenu['col_before']) {
                  ztab.ztmenu['col_before'].setDisabled(!p);
                }
                if(ztab.ztmenu['col_after']) {
                  ztab.ztmenu['col_after'].setDisabled(!p);
                }
                if(ztab.ztmenu['delete_col']) {
                  ztab.ztmenu['delete_col'].setDisabled(!p);
                }
                if(ztab.ztmenu['split_cells']) {
                  ztab.ztmenu['split_cells'].setDisabled(!p || (parseInt(ed.dom.getAttrib(p, 'colspan', '1')) < 2 && parseInt(ed.dom.getAttrib(p, 'rowspan', '1')) < 2));
                }
                if(ztab.ztmenu['merge_cells']) {
                  ztab.ztmenu['merge_cells'].setDisabled(!p);
                }
                if(ztab.ztmenu['delete_table']) {
                  ztab.ztmenu['delete_table'].setDisabled(!p);
                }
                
			});
        },

        createControl: function(n, cm) {
            var t = this;

            if (n == 'ztablecontrols') {
                    var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

                    var c = cm.createSplitButton('ztablemenu', {
                        title : 'table.desc',
                        cmd: 'mceInsertTable',
                        scope: t,
                        image : t.url + '/img/ImgTable.gif'
 				    });
                    c.ztmenu = {};

                    c.onRenderMenu.add(function(c, m) {
                        // Adds a submenu
                        var sub1 = m.addMenu({title : 'table.desc',icon: 'table'});

                        sub1.onShowMenu.add(function() {
                            var pdiv = DOM.get('menu_' + this.id + '_co');
                            var aTag = pdiv.getElementsByTagName('A');
                            DOM.setStyle(aTag, 'backgroundColor', '#FFFFFF');
                            var tbsize = DOM.get('tbsize1');
                            tbsize.innerHTML = "Table Size";
                        });

                        sub1.constructTable = function (xtr, ytd) {
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

                        sub1.renderNode = function() {
                            var t = this, s = t.settings, n, tb, co, w;
                            var Event = tinymce.dom.Event;
                            
                            w = DOM.create('div', {id : 'menu_' + t.id, 'class' : s['class'], 'style' : 'position:absolute;left:0;top:0;z-index:200000'});
                            co = DOM.add(w, 'div', {id : 'menu_' + t.id + '_co', 'class' : (s['class'] ? ' mceColorSplitMenu ' + s['class'] : '')});
                            //t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});

                            if (s.menu_line)
                                DOM.add(co, 'span', {'class' : t.classPrefix + 'Line'});

                            n = DOM.add(co, 'table', {id : 'menu_' + t.id + '_tbl', border : 0, cellPadding : 0, cellSpacing : 0,'class' : 'mceColorSplitMenu'});
                            tb = DOM.add(n, 'tbody');

                            tr = DOM.add(tb,'tr');
                            td = DOM.add(tr,'td',{id : 'tbsize1', rowspan : '1', colspan: '5', style : 'background-color:#9adffd;'});
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


                            Event.add(co, 'mouseover', function(e) {
                                e = e.target;
                                if(e.nodeName == 'A' && (xtr = e.getAttribute('xtr')) && (ytd = e.getAttribute('ytd'))) {
                                    var tbsize = DOM.get('tbsize1');
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

                            Event.add(co, 'mousedown', function(e) {
                                e = e.target;
                                if (e.nodeName == 'A' && (xtr = e.getAttribute('xtr')) && (ytd = e.getAttribute('ytd'))) {
                                    t.constructTable(xtr, ytd);
                                }
                                return Event.cancel(e); // Prevent IE auto save warning
                            });
                           

                            t.rendered = true;

                            return w;
                        }
                        sub1.add({title : 'Menu 1.1'});
                    
                        //m.add({title : 'table.desc', cmd : 'mceInsertTable', ui: true, icon: 'table'});
                        m.addSeparator();
                        c.ztmenu['row_props'] = m.add({id : 'row_props', title : 'table.row_desc', cmd : 'mceTableRowProps', ui: true, icon: 'row_props'});
                        c.ztmenu['row_props'].setDisabled(1);
                        c.ztmenu['cell_props'] = m.add({title : 'table.cell_desc', cmd : 'mceTableCellProps', ui: true, icon: 'cell_props'});
                        c.ztmenu['cell_props'].setDisabled(1);
                        m.addSeparator();
                        c.ztmenu['row_before'] = m.add({title : 'table.row_before_desc', cmd : 'mceTableInsertRowBefore', icon: 'row_before'});
                        c.ztmenu['row_before'].setDisabled(1);
                        c.ztmenu['row_after'] = m.add({title : 'table.row_after_desc', cmd : 'mceTableInsertRowAfter', icon: 'row_after'});
                        c.ztmenu['row_after'].setDisabled(1);
                        c.ztmenu['delete_row'] = m.add({title : 'table.delete_row_desc', cmd : 'mceTableDeleteRow', icon: 'delete_row'});
                        c.ztmenu['delete_row'].setDisabled(1);
                        m.addSeparator();
                        c.ztmenu['col_before'] = m.add({title : 'table.col_before_desc', cmd : 'mceTableInsertColBefore', icon: 'col_before'});
                        c.ztmenu['col_before'].setDisabled(1);
                        c.ztmenu['col_after'] = m.add({title : 'table.col_after_desc', cmd : 'mceTableInsertColAfter', icon: 'col_after'});
                        c.ztmenu['col_after'].setDisabled(1);
                        c.ztmenu['delete_col'] = m.add({title : 'table.delete_col_desc', cmd : 'mceTableDeleteCol', icon: 'delete_col'});
                        c.ztmenu['delete_col'].setDisabled(1);
                        m.addSeparator();
                        c.ztmenu['split_cells'] = m.add({title : 'table.split_cells_desc', cmd : 'mceTableSplitCells', ui: true, icon: 'split_cells'});
                        c.ztmenu['split_cells'].setDisabled(1);
                        c.ztmenu['merge_cells'] = m.add({title : 'table.merge_cells_desc', cmd : 'mceTableMergeCells', ui: true, icon: 'merge_cells'});
                        c.ztmenu['merge_cells'].setDisabled(1);
                        m.addSeparator();
                        c.ztmenu['delete_table'] = m.add({title : 'table.del', cmd : 'mceTableDelete', icon: 'delete_table'});
                        c.ztmenu['delete_table'].setDisabled(1);
                    });
                    /*
                    // Register buttons
			each([
				['table', 'table.desc', 'mceInsertTable', true],
				['delete_table', 'table.del', 'mceTableDelete'],
				['delete_col', 'table.delete_col_desc', 'mceTableDeleteCol'],
				['delete_row', 'table.delete_row_desc', 'mceTableDeleteRow'],
				['col_after', 'table.col_after_desc', 'mceTableInsertColAfter'],
				['col_before', 'table.col_before_desc', 'mceTableInsertColBefore'],
				['row_after', 'table.row_after_desc', 'mceTableInsertRowAfter'],
				['row_before', 'table.row_before_desc', 'mceTableInsertRowBefore'],
				['row_props', 'table.row_desc', 'mceTableRowProps', true],
				['cell_props', 'table.cell_desc', 'mceTableCellProps', true],
				['split_cells', 'table.split_cells_desc', 'mceTableSplitCells', true],
				['merge_cells', 'table.merge_cells_desc', 'mceTableMergeCells', true]
			], function(c) {
				ed.addButton(c[0], {title : c[1], cmd : c[2], ui : c[3]});
			});
                     */
                return c;
            }
        },

		getInfo : function() {
			return {
				longname : 'Ztable plugin for table controls',
				author : 'Zimbra Inc.,',
				authorurl : 'http://www.zimbra.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	tinymce.PluginManager.add('ztable', tinymce.plugins.ZTablePlugin);
})();