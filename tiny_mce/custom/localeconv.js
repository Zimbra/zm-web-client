/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2014, 2016 Synacor, Inc. All Rights Reserved.
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

    var language = locale.split('_', 1)[0];

    if (tinymce.inArray(tinyMCE.locale_list, language) >= 0)
        return language;

    // AFAICT both Taiwan and Hong-Kong use Traditional Chinese
    if (locale === "zh_HK" && tinymce.inArray(tinyMCE.locale_list, "zh_TW") >= 0)
        return "zh_TW";

    for (var i = 0, c = tinyMCE.locale_list.length; i < c; i++) {
        if (tinyMCE.locale_list[i].substr(0, 2) === language)
            return tinyMCE.locale_list[i];
    }

    return "en";
};

