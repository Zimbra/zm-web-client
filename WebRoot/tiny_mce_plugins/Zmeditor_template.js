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

Zmeditor_template.FONT_SIZE_MAPPING = {

    /*
    Exact font size mapping
    "11px":"xx-small",
    "13px":"x-small",
    "16px":"small",
    "19px":"medium",
    "24px":"large",
    "32px":"x-large",
    "48px":"xx-large",
    */

    "1":"xx-small",
    "2":"x-small",
    "3":"small",
    "4":"medium",
    "5":"large",
    "6":"x-large",
    "7":"xx-large",

    "9px":"xx-small",
    "10px":"xx-small",
    "11px":"xx-small",

    "12px":"x-small",
    "13px":"x-small",
    "14px":"x-small",

    "15px":"small",
    "16px":"small",
    "17px":"small",

    "18px":"medium",
    "19px":"medium",
    "20px":"medium",
    "21px":"medium",
    "22px":"medium",

    "23px":"large",
    "24px":"large",
    "25px":"large",
    "26px":"large",
    "27px":"large",

    "28px":"x-large",
    "29px":"x-large",
    "30px":"x-large",
    "31px":"x-large",
    "32px":"x-large",
    "33px":"x-large",
    "34px":"x-large",
    "35px":"x-large",
    "36px":"x-large",

    "37px":"xx-large",
    "38px":"xx-large",
    "39px":"xx-large",
    "40px":"xx-large",
    "41px":"xx-large",
    "42px":"xx-large",
    "43px":"xx-large",
    "44px":"xx-large",
    "45px":"xx-large",
    "46px":"xx-large",
    "47px":"xx-large",
    "48px":"xx-large",
    "49px":"xx-large",
    "50px":"xx-large"
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
            DOM = tinymce.DOM, each = tinymce.each; //Zimbra code

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

                if (ed.dom.is(n, s.theme_advanced_font_selector)) {
                    if (!fz && n.style.fontSize){
                        fz = n.style.fontSize;
                    }

                    if (!fn && n.style.fontFamily){
                        fn = n.style.fontFamily.replace(/[\"\']+/g, '').replace(/^([^,]+).*/, '$1').toLowerCase();
                    }

                    if (!fc && n.style.color)
                        fc = n.style.color;

                    if (!bc && n.style.backgroundColor)
                        bc = n.style.backgroundColor;
                }

                return false;
            });

            /* Zimbra Comment Start
            if (c = cm.get('fontselect')) {
                c.select(function(v) {
                    return v.replace(/^([^,]+).*//*, '$1').toLowerCase() == fn;
                });
            }
            Zimbra Comment End */

            if (c = cm.get('fontselect')) {

                /* This line is causing some error in firefox some times
                    uncaught exception: [Exception... "Component returned failure code: 0x80004001 (NS_ERROR_NOT_IMPLEMENTED) [nsIDOMNSHTMLDocument.queryCommandValue]" nsresult: "0x80004001 (NS_ERROR_NOT_IMPLEMENTED)"
                if(!fn){
                    fn = ed.getDoc().queryCommandValue("fontfamily");
                    if(fn){
                        fn = fn .replace(/[\"\']+/g, '').replace(/^([^,]+).*//*, '$1').toLowerCase();
                    }
                }
                */

                // Use computed style
                if (s.theme_advanced_runtime_fontsize && !fn) {
                    fn = ed.dom.getStyle(n, 'fontFamily', true);
                    if(fn){
                        fn = fn.replace(/[\"\']+/g, '').replace(/^([^,]+).*/, '$1').toLowerCase();
                    }
                }

                c.select(function(v) {
                    return v.replace(/^([^,]+).*/, '$1').toLowerCase() == fn;
                });
            }

            /* Zimbra Comment Start
            // Select font size
            if (c = cm.get('fontsizeselect')) {
                // Use computed style
                if (s.theme_advanced_runtime_fontsize && !fz && !cl)
                    fz = ed.dom.getStyle(n, 'fontSize', true);

                c.select(function(v) {
                    if (v.fontSize && v.fontSize === fz)
                        return true;

                    if (v['class'] && v['class'] === cl)
                        return true;
                });
            }
            Zimbra Comment End*/

            // Select font size
            if (c = cm.get('fontsizeselect')) {

                /*
                This line is causing some error in firefox some times
                uncaught exception: [Exception... "Component returned failure code: 0x80004001 (NS_ERROR_NOT_IMPLEMENTED) [nsIDOMNSHTMLDocument.queryCommandValue]" nsresult: "0x80004001 (NS_ERROR_NOT_IMPLEMENTED)"
                if(!fz){
                    fz = Zmeditor_template.FONT_SIZE_MAPPING[ed.getDoc().queryCommandValue("fontsize")];
                }
                */

                // Use computed style
                if (s.theme_advanced_runtime_fontsize && !fz && !cl) {
                    fz = ed.dom.getStyle(n, 'fontSize', true);
                    fz = Zmeditor_template.FONT_SIZE_MAPPING[fz] || fz;
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
                }
                updateColor('forecolor', fc);
                updateColor('backcolor', bc);
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
}(tinymce));