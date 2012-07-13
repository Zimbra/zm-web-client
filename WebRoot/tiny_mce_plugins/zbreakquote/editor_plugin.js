(function() {
    tinymce.create('tinymce.plugins.BreakQuote', {
        init : function(ed) {

            ed.onKeyDown.add(function(ed, ev) {

                if (ev.keyCode === 13) { // enter key

                    var blockquoteButton,
                        selection,
                        startContainer,
                        editorDom,
                        uniqueId,
                        blockquote,
                        nextSibling,
                        divElement,
                        splitElement;

                    if (ev.shiftKey) {
                        return;
                    }

                    //For checking cursor is inside blockquote element just check the status of blockquote button in tinymce toolbar
                    //ed.controlManager.get('blockquote').isActive() this will indicate cursor is inside blockquote element or not
                    blockquoteButton = ed.controlManager.get('blockquote');
                    if (!blockquoteButton || !blockquoteButton.isActive()) {
                        return;
                    }

                    selection = ed.selection;
                    startContainer = selection.getRng(true).startContainer;
                    if (!startContainer) {
                        return;
                    }

                    editorDom = ed.dom;
                    //Gets all parent block elements
                    blockquote = editorDom.getParents(startContainer, "blockquote", ed.getBody());
                    if (!blockquote) {
                        return;
                    }

                    blockquote = blockquote.pop();//Gets the last blockquote element
                    if (!blockquote || !blockquote.style.borderLeft) {//Checking blockquote left border for verifying it is reply blockquote
                        return;
                    }

                    uniqueId = editorDom.uniqueId();
                    ed.undoManager.add();
                    try {
                        selection.setContent("<div id='" + uniqueId + "'><br></div>");
                    }
                    catch (e) {
                        return;
                    }

                    divElement = ed.getDoc().getElementById(uniqueId);
                    if (divElement) {
                        divElement.removeAttribute("id");
                    }
                    else {
                        return;
                    }

                    nextSibling = divElement.nextSibling;
                    if (nextSibling && nextSibling.nodeName === "BR") {
                        nextSibling.parentNode.removeChild(nextSibling);
                    }

                    try {
                        splitElement = editorDom.split(blockquote, divElement);
                        if (splitElement) {
                            selection.select(splitElement);
                            selection.collapse(true);
                            ev.preventDefault();
                        }
                    }
                    catch (e) {
                    }
                }
            });
        },

        getInfo : function() {
            return {
                longname : 'ZBreakQuote to break up blockquotes when newline is entered',
                author : 'Zimbra Inc.,',
                authorurl : 'http://www.zimbra.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('zbreakquote', tinymce.plugins.BreakQuote);
})(tinymce);
