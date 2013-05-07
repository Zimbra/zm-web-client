/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013 VMware, Inc.
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
/**
 * Zmeditor_template.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This file overwrites some methods defined in editor_template.js file of TinyMCE
 *
 * Methods modified are commented for easy reference
 *
 * @author Hem Aravind
 */

Zmeditor_template = function() {

}

/*
    Chrome pt to px values
    "8pt":"11px",
    "10pt":"13px",
    "12pt":"16px",
    "14pt":"19px",
    "18pt":"24px",
    "24pt":"32px",
    "36pt":"48px",

    Firefox pt to px values
    "8pt":"10.6667px",
    "10pt":"13.3333px",12,13,14
    "12pt":"16px",15,16,17
    "14pt":"18.6667px",
    "18pt":"24px",
    "24pt":"32px",
    "36pt:"48px",

    Exact font size mapping
    "10px":"xx-small",
    "13px":"x-small",
    "16px":"small",
    "18px":"medium",
    "24px":"large",
    "32px":"x-large",
    "48px":"xx-large",
*/

/*
    will return string based font size based on px or pt
 */
Zmeditor_template.getFontSize = function(value){
    if (!value) {
        return;
    }
    value = (value+"").toLowerCase();
    if (value.indexOf("px") !== -1) {
        value = value.replace("px", "");
        if (value < 12) {
            return "xx-small";
        }
        else if (value >= 12 && value < 15) {
            return "x-small";
        }
        else if (value >= 15 && value < 17) {
            return "small";
        }
        else if (value >= 17 && value < 23) {
            return "medium";
        }
        else if (value >= 23 && value < 28) {
            return "large";
        }
        else if (value >= 28 && value < 37) {
            return "x-large";
        }
        else {
            return "xx-large";
        }
    }
    else if(value.indexOf("pt") !== -1) {
        value = value.replace("pt", "");
        if (value < 9) {
            return "xx-small";
        }
        else if (value >= 9 && value < 11) {
            return "x-small";
        }
        else if (value >= 11 && value < 13) {
            return "small";
        }
        else if (value >= 13 && value < 17) {
            return "medium";
        }
        else if (value >= 17 && value < 22) {
            return "large";
        }
        else if (value >= 22 && value < 30) {
            return "x-large";
        }
        else {
            return "xx-large";
        }
    }
    return ({
            1 : "xx-small",
            2 : "x-small",
            3 : "small",
            4 : "medium",
            5 : "large",
            6 : "x-large",
            7 : "xx-large"
        })[value] || value;
};

(function(tinymce) {

    var updateToolbar = {

        /*
         ed = editor
         cm = control manager
         n = node
         co = collapse
         ob = object
         */

        _nodeChanged : function(ed, cm, n, co, ob) {
            var t = this, p, de = 0, v, c, s = t.settings, cl, fz, fn, fc, bc, formatNames, matches,
            DOM = tinymce.DOM, each = tinymce.each, doc = ed.getDoc(), body = doc.body; //Zimbra code

            tinymce.each(t.stateControls, function(c) {
                cm.setActive(c, ed.queryCommandState(t.controls[c][1]));
            });

            function getParent(name) {
                var i, parents = ob.parents, func = name;

                if (typeof(name) == 'string') {
                    func = function(node) {
                        return node.nodeName == name;
                    };
                }

                for (i = 0; i < parents.length; i++) {
                    if (func(parents[i]))
                        return parents[i];
                }
            };

            cm.setActive('visualaid', ed.hasVisual);
            t._updateUndoStatus(ed);
            cm.setDisabled('outdent', !ed.queryCommandState('Outdent'));

            p = getParent('A');
            if (c = cm.get('link')) {
                if (!p || !p.name) {
                    c.setDisabled(!p && co);
                    c.setActive(!!p);
                }
            }

            if (c = cm.get('unlink')) {
                c.setDisabled(!p && co);
                c.setActive(!!p && !p.name);
            }

            if (c = cm.get('anchor')) {
                c.setActive(!co && !!p && p.name);
            }

            p = getParent('IMG');
            if (c = cm.get('image'))
                c.setActive(!co && !!p && n.className.indexOf('mceItem') == -1);

            if (c = cm.get('styleselect')) {
                t._importClasses();

                formatNames = [];
                each(c.items, function(item) {
                    formatNames.push(item.value);
                });

                matches = ed.formatter.matchAll(formatNames);
                c.select(matches[0]);
            }

            if (c = cm.get('formatselect')) {
                p = getParent(DOM.isBlock);

                if (p)
                    c.select(p.nodeName.toLowerCase());
            }

            // Find out current fontSize, fontFamily and fontClass
            getParent(function(n) {
                if (n.nodeName === 'SPAN') {
                    if (!cl && n.className)
                        cl = n.className;
                }

                if (!fz && (n.style.fontSize || n.size)) {
                    fz = n.style.fontSize || n.size;
                }
                if (!fn && (n.style.fontFamily || n.face)) {
                    fn = (n.style.fontFamily || n.face).replace(/[\"\']+/g, '').replace(/^([^,]+).*/, '$1').toLowerCase();
                }

                if (!fc && n.style.color)
                    fc = n.style.color;

                if (!bc && n.style.backgroundColor)
                    bc = n.style.backgroundColor;

                return false;
            });

            //select font family
            if (c = cm.get('fontselect')) {
                //console.log("sytle font family ::"+fn);
                //console.log("queryCommandValue :: "+ed.getDoc().queryCommandValue("fontname"));
                //console.log("Body "+ed.getBody().style.fontFamily);
                if (!fn) {
                    try {
                        fn = doc.queryCommandValue("fontname");
                    }
                    catch (e) {
                        //console.log("fontname");console.log(e);
                    }
                }
                fn = fn || body.style.fontFamily;
                if(fn){
                    fn = fn .replace(/[\"\']+/g, '').replace(/^([^,]+).*/, '$1').toLowerCase();
                }
                c.select(function(v) {
                    return v.replace(/^([^,]+).*/, '$1').toLowerCase() == fn;
                });
            }

            // Select font size
            if (c = cm.get('fontsizeselect')) {
                //console.log("sytle font size font size ::"+fz);
                //console.log("queryCommandValue :: "+ed.getDoc().queryCommandValue("fontSize"));
                //console.log("Body "+ed.getBody().style.fontSize);
                if (!fz) {
                    try {
                        fz = doc.queryCommandValue("fontsize");
                    }
                    catch (e) {
                        //console.log("fontsize");console.log(e);
                    }
                }
                fz = fz || body.style.fontSize;
                if (fz) {
                    fz = Zmeditor_template.getFontSize(fz);
                }
                c.select(function(v) {
                    if (v.fontSize && v.fontSize === fz)
                        return true;
                    {
                        if (v['class'] && v['class'] === cl)
                            return true;
                    }
                });
            }

            if (s.theme_advanced_show_current_color) {
                function updateColor(controlId, color) {
                    if (c = cm.get(controlId)) {
                        if (!color)
                            color = c.settings.default_color;
                        if (color !== c.value) {
                            c.displayColor(color);
                        }
                    }
                };

                if (tinymce.isIE) {
                    if (!fc) {
                        fc = ed.getDoc().queryCommandValue("forecolor");
                        if (fc) {
                            fc = "rgb(" + (fc & 0xFF) + "," + ((fc >> 8) & 0xFF) + "," + ((fc >> 16) & 0xFF) + ")";
                        }
                    }
                    if (!bc) {
                        bc = ed.getDoc().queryCommandValue("backcolor");
                        if (bc) {
                            bc = "rgb(" + (bc & 0xFF) + "," + ((bc >> 8) & 0xFF) + "," + ((bc >> 16) & 0xFF) + ")";
                        }
                    }
                }
                else {
                    if (!fc) {
                        try {
                            fc = doc.queryCommandValue("forecolor");
                        }
                        catch (e) {
                            //console.log("forecolor");console.log(e);
                        }
                    }
                    fc = fc || body.style.color;
                    if (!bc) {
                        try {
                            bc = doc.queryCommandValue("backcolor");
                        }
                        catch (e) {
                            //console.log("backcolor");console.log(e);
                        }
                    }
                    bc = bc || "white";
                }
                updateColor('forecolor', fc);
                updateColor('backcolor', bc);
            }

            if (s.theme_advanced_path && s.theme_advanced_statusbar_location) {
                p = DOM.get(ed.id + '_path') || DOM.add(ed.id + '_path_row', 'span', {id : ed.id + '_path'});

                if (t.statusKeyboardNavigation) {
                    t.statusKeyboardNavigation.destroy();
                    t.statusKeyboardNavigation = null;
                }

                DOM.setHTML(p, '');

                getParent(function(n) {
                    var na = n.nodeName.toLowerCase(), u, pi, ti = '';

                    // Ignore non element and bogus/hidden elements
                    if (n.nodeType != 1 || na === 'br' || n.getAttribute('data-mce-bogus') || DOM.hasClass(n, 'mceItemHidden') || DOM.hasClass(n, 'mceItemRemoved'))
                        return;

                    // Handle prefix
                    if (tinymce.isIE && n.scopeName !== 'HTML')
                        na = n.scopeName + ':' + na;

                    // Remove internal prefix
                    na = na.replace(/mce\:/g, '');

                    // Handle node name
                    switch (na) {
                        case 'b':
                            na = 'strong';
                            break;

                        case 'i':
                            na = 'em';
                            break;

                        case 'img':
                            if (v = DOM.getAttrib(n, 'src'))
                                ti += 'src: ' + v + ' ';

                            break;

                        case 'a':
                            if (v = DOM.getAttrib(n, 'name')) {
                                ti += 'name: ' + v + ' ';
                                na += '#' + v;
                            }

                            if (v = DOM.getAttrib(n, 'href'))
                                ti += 'href: ' + v + ' ';

                            break;

                        case 'font':
                            if (v = DOM.getAttrib(n, 'face'))
                                ti += 'font: ' + v + ' ';

                            if (v = DOM.getAttrib(n, 'size'))
                                ti += 'size: ' + v + ' ';

                            if (v = DOM.getAttrib(n, 'color'))
                                ti += 'color: ' + v + ' ';

                            break;

                        case 'span':
                            if (v = DOM.getAttrib(n, 'style'))
                                ti += 'style: ' + v + ' ';

                            break;
                    }

                    if (v = DOM.getAttrib(n, 'id'))
                        ti += 'id: ' + v + ' ';

                    if (v = n.className) {
                        v = v.replace(/\b\s*(webkit|mce|Apple-)\w+\s*\b/g, '')

                        if (v) {
                            ti += 'class: ' + v + ' ';

                            if (DOM.isBlock(n) || na == 'img' || na == 'span')
                                na += '.' + v;
                        }
                    }

                    na = na.replace(/(html:)/g, '');
                    na = {name : na, node : n, title : ti};
                    t.onResolveName.dispatch(t, na);
                    ti = na.title;
                    na = na.name;

                    //u = "javascript:tinymce.EditorManager.get('" + ed.id + "').theme._sel('" + (de++) + "');";
                    pi = DOM.create('a', {'href' : "javascript:;", role: 'button', onmousedown : "return false;", title : ti, 'class' : 'mcePath_' + (de++)}, na);

                    if (p.hasChildNodes()) {
                        p.insertBefore(DOM.create('span', {'aria-hidden': 'true'}, '\u00a0\u00bb '), p.firstChild);
                        p.insertBefore(pi, p.firstChild);
                    } else
                        p.appendChild(pi);
                }, ed.getBody());

                if (DOM.select('a', p).length > 0) {
                    t.statusKeyboardNavigation = new tinymce.ui.KeyboardNavigation({
                        root: ed.id + "_path_row",
                        items: DOM.select('a', p),
                        excludeFromTabOrder: true,
                        onCancel: function() {
                            ed.focus();
                        }
                    }, DOM);
                }
            }
        }
    }
    tinymce.extend(tinymce.themes.AdvancedTheme.prototype, updateToolbar);
    tinymce.extend(tinymce.dom.DOMUtils.prototype, {
        uniqueId : function(p){
                        var id = (!p ? "mce_" : p) + this.counter++;
                        if( document.getElementById(id) ){
                            return this.uniqueId(p);
                        }
                        return id;
                    }
    });
    tinymce.extend(tinymce.Editor.prototype, {
        saveHTML : function(){
            var ele = this.getElement();
            if(ele && ele.nodeName === "TEXTAREA"){
                ele.value = this.getContent();
            }
        }
    });

    var scriptLoader = tinymce.ScriptLoader,
        locale;
    if (scriptLoader && scriptLoader.load && typeof ZmAdvancedHtmlEditor !== "undefined") {
        locale = ZmAdvancedHtmlEditor.LOCALE;
        if (locale && locale !== "en") {
            scriptLoader.load('../js/ajax/3rdparty/tinymce/themes/advanced/langs/' + locale +'.js');
        }
    }

    tinymce.create('tinymce.plugins.onEditorEvent', {
        init : function(ed) {

            ed.onBeforeSetContent.add(function(ed, o) {
                // Replaces all double br elements for avoiding enter issue
                o.content = o.content.replace(/<br><br>/ig, '<br><div><br></div>');
            });

            /*
            if (tinymce.isIE) {
                ed.onPostRender.add(function(ed) {
                    var doc = ed.getDoc(),
                        head = doc.getElementsByTagName('head')[0],
                        style = doc.createElement('style'),
                        rules = doc.createTextNode('p{margin:0;}');

                    style.type = 'text/css';
                    if(style.styleSheet)
                        style.styleSheet.cssText = rules.nodeValue;
                    else
                        style.appendChild(rules);
                    head.appendChild(style);
                });
                ed.onBeforeSetContent.add(function(ed, o) {
                    console && console.log("isDirty ::"+ed.isDirty());
                    var content = o.content;
                    //console && console.log("content before ::"+content);
                    if (content) {
                        o.content = content.replace(/<br><br>/gi, '<br><div><br></div>');
                    }
                    //console && console.log("content after ::"+ o.content);
                });
                //Replacing p tag with div tag
                ed.onGetContent.add(function(ed, o) {
                    console && console.log("isDirty ::"+ed.isDirty());
                    if (ed.isDirty()) {
                        var content = o.content;
                        //console && console.log("content before ::"+content);
                        if (content) {
                            o.content = content.replace(/<p/gi, '<div').replace(/\/p>/gi, '/div>');
                        }
                        //console && console.log("content after ::"+ o.content);
                    }
                });
                ed.onKeyDown.add(function(ed, e) {
                    if (e.keyCode === 13) {
                        //console && console.log("aaa "+ed.selection.getStart().nodeName);
                    }
                });
            }
            */

        }
    });
    // Register plugin
    tinymce.PluginManager.add('zimbraplugin', tinymce.plugins.onEditorEvent);

    /*
     *    Modifying tinymce's default showMenu and HideMenu methods of dropmenu and colorsplitbutton as defaultShowMenu and defaultHideMenu
     *
     *    Notifying ZmAdvancedHtmlEditor about the showMenu and hideMenu events (useful for hiding the menu when mousdedown event happens outside the editor)
     */

    if (typeof ZmAdvancedHtmlEditor !== "undefined") {

        var tinymceUI = tinymce.ui,
            dropMenuPrototype = tinymceUI.DropMenu.prototype,
            colorSplitButtonPrototype = tinymceUI.ColorSplitButton.prototype,
            showMenu,
            hideMenu;

        showMenu = function() {
            this.defaultShowMenu.apply(this, arguments);
            ZmAdvancedHtmlEditor.onShowMenu(this);
        };

        hideMenu = function() {
            this.defaultHideMenu.apply(this, arguments);
            ZmAdvancedHtmlEditor.onHideMenu(this);
        };

        tinymce.extend(dropMenuPrototype, {
            defaultShowMenu : dropMenuPrototype.showMenu,
            defaultHideMenu : dropMenuPrototype.hideMenu,
            showMenu : showMenu,
            hideMenu : hideMenu
        });

        tinymce.extend(colorSplitButtonPrototype, {
            defaultShowMenu : colorSplitButtonPrototype.showMenu,
            defaultHideMenu : colorSplitButtonPrototype.hideMenu,
            showMenu : showMenu,
            hideMenu : hideMenu
        });
    }

}(tinymce));