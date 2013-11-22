/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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

/**
 * Returns a TinyMCE language corresponding to a Zimbra locale.
 *
 * Shared between the Standard and AJAX clients.
 */
tinyMCE.getlanguage = function(locale)
{
    if (tinymce.inArray(tinyMCE.locale_list, locale) >= 0)
        return locale;

    var language = locale.substr(0, 2);

    if (tinymce.inArray(tinyMCE.locale_list, language) >= 0)
        return locale;

    // AFAICT both Taiwan and Hong-Kong use Traditional Chinese
    if (locale === "zh_HK" && tinymce.inArray(tinyMCE.locale_list, "zh_TW") >= 0)
        return "zh_TW";

    for (var i = 0, c = tinyMCE.locale_list.length; i < c; i++) {
        if (tinyMCE.locale_list[i].substr(0, 2) === language)
            return tinyMCE.locale_list[i];
    }

    return "en";
};

