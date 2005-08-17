// @copyright@


function LaMsg() {
}

LaMsg.STBM_SEARCHFOR_Account = "Account";
LaMsg.Of = "of";
LaMsg.Unlimited = "unlimited";

//Domain configuration labels 
LaMsg.AuthMech_liquid="Internal";
LaMsg.AuthMech_ldap = "External LDAP";
LaMsg.AuthMech_ad = "External Active Directory";

LaMsg.GALMode_internal="Internal";
LaMsg.GALMode_external="External";
LaMsg.GALMode_both="Both";

LaMsg.GALServerType_ldap="LDAP";
LaMsg.GALServerType_ad="Active Directory";

//tab titles
LaMsg.Domain_Tab_General = "General";
LaMsg.Domain_Tab_GAL = "GAL";
LaMsg.Domain_Tab_Authentication = "Authentication";

LaMsg.Domain_Auth_Config_Complete = "Configuration of authentication mechanism is complete.";
LaMsg.Domain_Auth_ConfigSummary = "Summary of authentication settings:";
LaMsg.Domain_AuthProvideLoginPwd = "Please provide username and password to test the authentication settings";
LaMsg.Domain_AuthTestUserName = "User name";
LaMsg.Domain_AuthTestPassword = "Password";
LaMsg.Domain_AuthTestSettings = "Test";
LaMsg.Domain_AuthTestingInProgress = "Trying to authenticate using the new settings";
LaMsg.Domain_AuthTestResults = "Test results";
LaMsg.Domain_AuthTestSuccessful = "Authentication test successful";
LaMsg.Domain_AuthTestFailed = "Authentication test failed";
LaMsg.Domain_AuthTestResultCode = "Server message";
LaMsg.Domain_AuthTestMessage = "Details";
LaMsg.Domain_AuthComputedBindDn = "Computed bind DN used in the test";

LaMsg.AuthTest_check_OK = "Test Successful";
LaMsg.AuthTest_check_UNKNOWN_HOST = "Unable to resolve a hostname";
LaMsg.AuthTest_check_CONNECTION_REFUSED = "Connection to a port was refused";
LaMsg.AuthTest_check_SSL_HANDSHAKE_FAILURE = "SSL connect problem, most likely untrusted certificate";
LaMsg.AuthTest_check_COMMUNICATION_FAILURE = "Generic communication failure";
LaMsg.AuthTest_check_AUTH_FAILED = "Authentication failed. Invalid credentials (bad dn/password)";
LaMsg.AuthTest_check_AUTH_NOT_SUPPORTED = "Authentication flavor not supported. LDAP server probably configured to not allow passwords.";
LaMsg.AuthTest_check_NAME_NOT_FOUND = "Unable to resolve an LDAP name. Most likely invalid search base";
LaMsg.AuthTest_check_INVALID_SEARCH_FILTER = "Invalid ldap search filter";
LaMsg.AuthTest_check_FAILURE = "Generic failure";

LaMsg.Domain_GAL_Config_Complete = "GAL search configuration complete.";
LaMsg.Domain_GAL_ConfigSummary = "Summary of GAL search settings";
LaMsg.Domain_GALTestSettings = "Test";
LaMsg.Domain_GALTestingInProgress = "Please wait while the server is testing new GAL search settings...";
LaMsg.Domain_GALTestResults = "Test result";
LaMsg.Domain_GALTestSuccessful = "Test Successful";
LaMsg.Domain_GALTestFailed = "GAL search test failed";
LaMsg.Domain_GALTestResult = "Test result";
LaMsg.Domain_GALTestMessage = "Details";
LaMsg.Domain_GALSampleSearchName = "Please provide a search term";  

LaMsg.Domain_Config_Complete = "Configuration of the new domain is complete.<br>Please press 'FINISH' to save the new domain.";
LaMsg.Domain_DomainName = "Domain name:";
LaMsg.Domain_GalMode = "GAL mode:";
LaMsg.Domain_GALServerType = "Server type:";
LaMsg.Domain_GALServerName = "External server name:";
LaMsg.Domain_GALServerPort = "External server port:";
LaMsg.Domain_GALUseSSL = "Use SSL:";
LaMsg.Domain_UseBindPassword = "Use DN/Password to bind to external server:";
LaMsg.Domain_GalLdapURL = "LDAP URL";
LaMsg.Domain_GalLdapSearchBase = "LDAP search base:";
LaMsg.Domain_GalLdapBindDn = "Bind DN:";
LaMsg.Domain_GalLdapBindPassword = "Bind password:";
LaMsg.Domain_GalLdapBindPasswordConfirm = "Confirm bind password:";
LaMsg.Domain_GalLdapFilter = "LDAP filter:";
LaMsg.Domain_AuthMech = "Authentication mechanism:";
LaMsg.Domain_AuthLdapURL = "LDAP URL";
LaMsg.Domain_AuthLdapUserDn = "LDAP bind DN template:";
LaMsg.Domain_AuthADServerName = "Active Directory server name:";
LaMsg.Domain_AuthADDomainName = "Active Directory domain name:";
LaMsg.Domain_AuthADServerPort = "Active Directory server port";
LaMsg.Domain_AuthADUseSSL = "Use SSL to connect to Active Directory server:";
LaMsg.Domain_AuthLDAPServerName = "LDAP server name:";
LaMsg.Domain_AuthLDAPSearchBase = "LDAP search base:";
LaMsg.Domain_AuthLDAPServerPort = "LDAP server port:";
LaMsg.Domain_AuthLDAPUseSSL = "Use SSL to connect to LDAP server:";

LaMsg.Restore_SelectPath = "Please provide the path to the backup targets.";
LaMsg.Restore_AccountName = "Please provide the email address of the account that you want to restore.";
LaMsg.Restore_EmailAddress = "Email Address";
LaMsg.Restore_SelectServer = "Please select the server for the restored acount.";
LaMsg.Restore_OriginalServer = "This account was hosted by the server:";
LaMsg.Restore_TargetServer = "Target server:";
LaMsg.Restore_TargetPath = "Path to the backup target:";
LaMsg.Restore_Prefix = "Prefix for the new account name:";
LaMsg.Restore_method= "Restore method:";
LaMsg.Restore_SelectLabel = "Please select the backup label to restore from.";
LaMsg.Restore_Label = "Backup label to restore from:";
LaMsg.Restore_Restore = "Restore";
LaMsg.Restore_NoLabelsFound = "Could not find any backup labels in the specified target";
LaMsg.Restore_LabelsProblem = "Server encountered a problem when looking for backup labels";
LaMsg.Restore_IncludeIncrementals = "Include incremental backups";
LaMsg.Restore_LookingForLabels = "Looking for labels";
LaMsg.Restore_Restoring = "Restoring";
LaMsg.Restore_RestoreSuccess = "Mailbox succesfully restored.";

LaMsg.NoAliases = "This account does not have any aliases";
LaMsg.NoFwd = "No forwarding defined for this account";
LaMsg.Forward = "Forward";
LaMsg.NextPage_tt = "Go to next page";
LaMsg.PrevPage_tt = "Go to previous page"
LaMsg.Back = "Back";
LaMsg.appExitWarning = "Doing so will terminate LiquidAdmin";
// overview panel status
LaMsg.OVP_accounts = "Accounts";
LaMsg.OVP_cos = "Class of Service";
LaMsg.OVP_domains = "Domains";
LaMsg.OVP_global = "Global Settings";
LaMsg.OVP_servers = "Servers";
LaMsg.OVP_status = "Status";
LaMsg.OVP_statistics = "Statistics";

LaMsg.LST_ClickToSort_tt = "Sort by ";

LaMsg.NAD_GlobalStatistics = "System-wide Information";
LaMsg.NAD_ServerStatistics = "Server:";
LaMsg.NAD_bytes = "bytes";
LaMsg.TBB_New = "New";

LaMsg.TBB_Close = "Close";
LaMsg.TBB_Save = "Save";
LaMsg.TBB_Edit = "Edit";
LaMsg.TBB_EditAliases = "Edit Aliases";
LaMsg.TBB_Delete = "Delete";
LaMsg.TBB_Duplicate = "Duplicate";
LaMsg.TBB_Refresh = "Refresh";
LaMsg.TBB_ChngPwd = "Change Password";
LaMsg.TBB_ViewMail = "View Mail";
LaMsg.TBB_RestoreMailbox = "Restore";
LaMsg.TBB_Refresh_tt = "Refresh list";

LaMsg.ALTBB_Save_tt = "Save changes";
LaMsg.ALTBB_Close_tt = "Close this view";
LaMsg.ALTBB_New_tt = "New account";
LaMsg.ALTBB_Edit_tt = "Edit account";
LaMsg.ALTBB_Edit_Aliases_tt = "Edit account aliases";
LaMsg.ALTBB_Delete_tt = "Delete account";
LaMsg.ACTBB_New_tt = "New account";
LaMsg.ACTBB_Edit_tt = "Edit account"
LaMsg.ACTBB_Delete_tt = "Delete account";
LaMsg.ACTBB_ChngPwd_tt = "Change user's password";
LaMsg.ACTBB_ViewMail_tt = "Login to email application on behalf of this account";
LaMsg.ACTBB_Restore_tt = "Restore an account";

LaMsg.DTBB_New_tt = "New domain";
LaMsg.DTBB_Edit_tt = "Edit domain";
LaMsg.DTBB_Delete_tt = "Delete domain";
LaMsg.DTBB_Save_tt = "Save changes";
LaMsg.DTBB_Close_tt = "Close this view";
LaMsg.DTBB_GAlConfigWiz = "Configure GAL";
LaMsg.DTBB_GAlConfigWiz_tt = "Open Global Address List Configuration Wizard";
LaMsg.DTBB_AuthConfigWiz = "Configure Authentication";
LaMsg.DTBB_AuthConfigWiz_tt = "Open Authentication Mechanism Configuration Wizard";

LaMsg.COSTBB_New_tt = "New COS";
LaMsg.COSTBB_Edit_tt = "Edit COS";
LaMsg.COSTBB_Delete_tt = "Delete COS";
LaMsg.COSTBB_Duplicate_tt = "Duplicate COS";
LaMsg.COSTBB_Save_tt = "Save changes";
LaMsg.COSTBB_Close_tt = "Close this view";

LaMsg.Alert_ServerDetails = 
	"<b>Note:</b> Settings on an individual server override global settings.";
LaMsg.Alert_GlobalConfig = 
	"<b>Note:</b> "+
	"Settings only apply to servers that have the appropriate service(s) "+
	"installed and enabled. Server settings override global settings.";
LaMsg.Alert_ServerRestart = 
	"<b>Note:</b> "+
	"Changes to settings requires server restart in order to take effect.";	

LaMsg.SERTBB_New_tt = "New server";
LaMsg.SERTBB_Edit_tt = "Edit server";
LaMsg.SERTBB_Delete_tt = "Delete server";
LaMsg.SERTBB_Save_tt = "Save changes";
LaMsg.SERTBB_Close_tt = "Close this view";

LaMsg.ALV_Name_col = "E-Mail Address";
LaMsg.ALV_FullName_col = "Full Name";
LaMsg.ALV_DspName_col = "Display Name";
LaMsg.ALV_Status_col = "Status";
LaMsg.ALV_Description_col =  "Description";

LaMsg.CLV_Name_col = "Name";
LaMsg.CLV_Description_col =  "Description";

LaMsg.DLV_Name_col = "Name";
LaMsg.DLV_Description_col =  "Description";

LaMsg.SLV_Name_col = "Name";
LaMsg.SLV_ServiceHName_col =  "Service host name:";
LaMsg.SLV_Description_col =  "Description";

LaMsg.STV_Server_col = "Server";
LaMsg.STV_Service_col = "Service";
LaMsg.STV_Time_col = "Time";
LaMsg.STV_Status_col = "Status";

LaMsg.NAD_Tab_General= "General";
LaMsg.NAD_Tab_Attachments = "Attachments";
LaMsg.NAD_Tab_MTA = "MTA";
LaMsg.NAD_Tab_POP = "POP";
LaMsg.NAD_Tab_IMAP = "IMAP";
LaMsg.NAD_Tab_AntiSpam = "Anti-Spam";
LaMsg.NAD_Tab_AntiVirus = "Anti-Virus";
LaMsg.NAD_Tab_General = "General";
LaMsg.NAD_Tab_Services = "Services";

LaMsg.NAD_Service_EnabledServices = "Enabled services:";
LaMsg.NAD_Service_LDAP = "LDAP";
LaMsg.NAD_Service_Mailbox = "Mailbox";
LaMsg.NAD_Service_MTA = "MTA";
LaMsg.NAD_Service_SNMP = "SNMP";
LaMsg.NAD_Service_AntiVirus = "Anti-Virus";
LaMsg.NAD_Service_AntiSpam = "Anti-Spam";

LaMsg.NAD_Dialog_ShutdownEmailService = "You are about to shutdown the Email service on this server!";
LaMsg.NAD_Dialog_SaveChanges = "Do you want so save current changes?";

// REVISIT: Account, New Account, and COS forms should be re-organized in
//			order to avoid duplicating these two labels.
LaMsg.NAD_RemoveAllAttachments = "Disable attachment viewing from web mail UI";
LaMsg.NAD_AttachmentsViewInHtmlOnly = "Convert attachments to HTML for viewing";

LaMsg.NAD_Attach_IncomingAttachments = "Attachment settings:";
LaMsg.NAD_Attach_RemoveAllAttachments = "Disable attachment viewing from web mail UI";
LaMsg.NAD_Attach_ViewInHtml = "Convert attachments to HTML for viewing";
LaMsg.NAD_Attach_RemoveAttachmentsByExt = "Reject messages with attachment extensions";
LaMsg.NAD_Attach_NewExtension = "New extension:";
LaMsg.NAD_Attach_AddExtension = "Add";

LaMsg.NAD_MTA_Authentication = "Authentication:";
LaMsg.NAD_MTA_AuthenticationEnabled = "Enabled";
LaMsg.NAD_MTA_TlsAuthenticationOnly = "TLS authentication only";
LaMsg.NAD_MTA_WebMailHostname = "Web mail MTA:";
LaMsg.NAD_MTA_WebMailPort = "Port:";
LaMsg.NAD_MTA_WebMailTimeout = "Web mail MTA timeout (s):";
LaMsg.NAD_MTA_RelayHostname = "Relay MTA for external delivery:";
LaMsg.NAD_MTA_MaxMsgSize = "Maximum message size (kb):";
LaMsg.NAD_MTA_Options = "Options:";
LaMsg.NAD_MTA_DnsLookups = "DNS lookups enabled";
LaMsg.NAD_MTA_ProtocolChecks = "Protocol checks:";
LaMsg.NAD_MTA_reject_invalid_hostname = "Hostname in greeting violates RFC (reject_invalid_hostname)";
LaMsg.NAD_MTA_reject_non_fqdn_hostname = "Client must greet with a fully qualified hostname (reject_non_fqdn_hostname)";
LaMsg.NAD_MTA_reject_non_fqdn_sender = "Sender address must be fully qualified (reject_non_fqdn_sender)";
LaMsg.NAD_MTA_DnsChecks = "DNS checks:";
LaMsg.NAD_MTA_reject_unknown_client = "Client's IP address (reject_unknown_client)";
LaMsg.NAD_MTA_reject_unknown_hostname = "Hostname in greeting (reject_unknown_hostname)";
LaMsg.NAD_MTA_reject_unknown_sender_domain = "Sender's domain (reject_unknown_sender_domain)";

LaMsg.NAD_Spam_Checking = "Spam checking:";
LaMsg.NAD_Spam_CheckingEnabled = "Enabled";
LaMsg.NAD_Spam_KillPercent = "Kill percent:";
LaMsg.NAD_Spam_TagPercent = "Tag percent:";
LaMsg.NAD_Spam_SubjectPrefix = "Subject prefix:";

LaMsg.NAD_Virus_Checking = "Virus checking:";
LaMsg.NAD_Virus_CheckingEnabled = "Enabled";
LaMsg.NAD_Virus_DefUpdateFreq = "Definition update frequency (hrs):";
LaMsg.NAD_Virus_Options = "Options:";
LaMsg.NAD_Virus_BlockEncrypted = "Block encrypted archives";
LaMsg.NAD_Virus_NotifyAdmin = "Send notification to administrator";
LaMsg.NAD_Virus_NotifyRecipient = "Send notification to recipient";

LaMsg.NAD_PrefContactsPerPage = "Contacts per page";
LaMsg.NAD_AuthTokenLifetime = "Session token lifetime";
LaMsg.NAD_AdminAuthTokenLifetime = "Admin Session Token Lifetime";
LaMsg.NAD_MailMessageLifetime = "E-mail message lifetime";
LaMsg.NAD_MailTrashLifetime = "Trashed message lifetime";
LaMsg.NAD_MailSpamLifetime = "Spam message lifetime";
LaMsg.NAD_Title = "Create New Account";
LaMsg.NAD_AccountName = "Account name";
LaMsg.NAD_Account = "Account";
LaMsg.NAD_FirstName = "First name";
LaMsg.NAD_LastName = "Last name";
LaMsg.NAD_DisplayName = "Display name";
LaMsg.NAD_Initials = "Middle initial";
LaMsg.NAD_IsAdmin = "Administrator account";
LaMsg.NAD_MustChangePwd = "Must change password";
LaMsg.NAD_Password = "Password";
LaMsg.NAD_Notes = "Notes";
LaMsg.NAD_MailQuota = "Account quota (mb)";
LaMsg.NAD_MailBoxSize = "Mail Box Size";
LaMsg.NAD_ContactMaxNumEntries = "Address book size limit";
LaMsg.NAD_AccountStatus = "Account status";
LaMsg.NAD_ConfirmPassword = "Confirm password";
LaMsg.NAD_ClassOfService = "Class of service";
LaMsg.NAD_MailServer = "Mail Server";
LaMsg.NAD_passMinLength="Minimum password length";
LaMsg.NAD_passMaxLength="Maximum password length";
LaMsg.NAD_passMinAge="Minimum password age";
LaMsg.NAD_passMaxAge="Maximum password age";
LaMsg.NAD_passEnforceHistory="Enforce password history";
LaMsg.NAD_prefMailSignature="Mail signature";
LaMsg.NAD_prefMailSignatureEnabled="Enable mail signature";
LaMsg.NAD_prefSaveToSent="Save to sent";
LaMsg.NAD_telephoneNumber="Phone";
LaMsg.NAD_company = "Company";
LaMsg.NAD_city ="City";
LaMsg.NAD_zip ="Postal code";
LaMsg.NAD_state ="State";
LaMsg.NAD_country ="Country";
LaMsg.NAD_office = "Office";
LaMsg.NAD_orgUnit="Department";
LaMsg.NAD_postalAddress ="Address";
LaMsg.NAD_Description = "Description";

LaMsg.NAD_Domain = "Domain";
LaMsg.NAD_Aliases = "Aliases";
LaMsg.NAD_Add = "Add";
LaMsg.NAD_Remove = "Remove";
LaMsg.NAD_ForwardTo = "Forward mail to";
LaMsg.NAD_COSName = "COS Name";
LaMsg.NAD_PwdLocked = "Password locked";
LaMsg.NAD_ResetToCOS = "Enforce to COS value";
LaMsg.NAD_OverrideCOS = "Override COS";
LaMsg.NAD_LiquidID = "ID:";
LaMsg.NAD_new = "new";
LaMsg.NAD_GalMaxResults = "Most results returned by GAL search:";

LaMsg.NAD_StatsDataLastDay = "24 hour window";
LaMsg.NAD_StatsDataLast3Months = "3 months window";
LaMsg.NAD_StatsDataLast12Months = "12 months window";
LaMsg.NAD_DefaultDomainName = "Default domain:";

LaMsg.TABT_StatsDataLastDay = "24 Hours";
LaMsg.TABT_StatsDataLast3Months = "3 Months";
LaMsg.TABT_StatsDataLast12Months = "12 Months";

//LaMsg.NAD_StatsMsgsLastDay = "Messages in last day";
//LaMsg.NAD_StatsMsgsLast3Months = "Messages in last 3 months";
//LaMsg.NAD_StatsMsgsLast12Months = "Messages in last 12 months";
LaMsg.NAD_StatsMsgsLastDay = "24 hour window";
LaMsg.NAD_StatsMsgsLast3Months = "3 months window";
LaMsg.NAD_StatsMsgsLast12Months = "12 months window";
LaMsg.NAD_LastLogonTimestampFrequency = "Last Logon Timestamp Frequency";

LaMsg.NAD_ServiceConfiguredRole = "Configured Role";
LaMsg.NAD_ServiceCurrentRole = "Current Role";
LaMsg.NAD_ServiceHostname = "Service Host Name";
LaMsg.NAD_Server = "Server: ";
//lmtp
LaMsg.NAD_LmtpAdvertisedName = "LMTP advertised name:";
LaMsg.NAD_LmtpBindAddress = "LMTP bind address:";
LaMsg.NAD_LmtpBindPort = "LMTP bind port:";
LaMsg.NAD_LmtpNumThreads = "LMTP number of threads:";
//pop3
LaMsg.NAD_POP_Service = "POP3 service:";
LaMsg.NAD_POP_Enabled = "Enabled";
LaMsg.NAD_POP_Address = "Address:";
LaMsg.NAD_POP_Port = "Port:";
LaMsg.NAD_POP_SSL = "SSL for POP3 service:";
LaMsg.NAD_POP_Options = "Options:";
LaMsg.NAD_POP_CleartextLoginEnabled = "Enable clear text login";
LaMsg.NAD_POP_AdvertisedName ="Advertised name:";
LaMsg.NAD_POP_NumThreads = "Number of threads:";
//imap
LaMsg.NAD_IMAP_Service="IMAP service:";
LaMsg.NAD_IMAP_Enabled="Enabled";
LaMsg.NAD_IMAP_Port="Port:";
LaMsg.NAD_IMAP_SSLService="SSL for IMAP service:";
LaMsg.NAD_IMAP_Options = "Options:";
LaMsg.NAD_IMAP_CleartextLoginEnabled="Enable clear text login";

LaMsg.NAD_MS = "ms"; //milliseconds
LaMsg.NAD_Sec = "seconds"; //milliseconds

LaMsg.NAD_RedologFsyncIntervalMS = "FSync interval for redo log";
LaMsg.NAD_UIFeatures="UI Features:";

//Features
LaMsg.NAD_liquidFeatureHtmlComposeEnabled = "HTML compose";
LaMsg.NAD_FeatureGalEnabled = "GAL access"
LaMsg.NAD_FeatureContactsEnabled="Contacts";
LaMsg.NAD_FeatureCalendarEnabled="Calendar";
LaMsg.NAD_FeatureTaggingEnabled="Tagging";
LaMsg.NAD_FeatureAdvancedSearchEnabled="Advanced search";
LaMsg.NAD_FeatureSavedSearchesEnabled="Saved searches";
LaMsg.NAD_FeatureConversationsEnabled="Conversations";
LaMsg.NAD_FeatureChangePasswordEnabled="Change password";
LaMsg.NAD_FeatureInitialSearchPreferenceEnabled="Initial search preference";
LaMsg.NAD_FeatureFiltersEnabled="Filters"
LaMsg.NAD_liquidAttachmentsIndexingEnabled = "Attachment indexing";
LaMsg.NAD_liquidImapEnabled = "IMAP access";
LaMsg.NAD_liquidPop3Enabled = "POP3 access";
LaMsg.NAD_liquidPrefShowFragments = "Show fragments";
LaMsg.NAD_liquidPrefReplyIncludeOriginalText = "When replying, include original text";
LaMsg.NAD_liquidPrefForwardIncludeOriginalText = "When forwarding, include original text";
LaMsg.NAD_liquidPrefComposeInNewWindow = "Always compose in new window";
LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat = "Reply/forward using format of the original message";
LaMsg.NAD_liquidPrefAutoAddAddressEnabled = "Enable automatic adding of contacts";
LaMsg.NAD_liquidPrefMailItemsPerPage = "Number of items to display per page";
LaMsg.NAD_liquidPrefComposeFormat = "Always compose mail using";
LaMsg.NAD_liquidPrefGroupMailBy = "Group mail by";
LaMsg.NAD_liquidPrefMessageViewHtmlPreferred = "View mail as HTML (when possible)"
LaMsg.NAD_liquidPrefNewMailNotificationEnabled = "Enable address for new mail notifications";
LaMsg.NAD_liquidPrefNewMailNotificationAddress = "Address for new mail notifications";
LaMsg.NAD_liquidPrefOutOfOfficeReplyEnabled = "Away message enabled";
LaMsg.NAD_liquidPrefOutOfOfficeReply = "Away message";
LaMsg.NAD_liquidPrefMailInitialSearch="Initial mail search";
LaMsg.NAD_liquidPrefShowSearchString = "Show search string"
LaMsg.NAD_liquidPrefMailSignatureStyle = "Signature style";
LaMsg.NAD_liquidPrefUseTimeZoneListInCalendar = "Show timezone list in appointment view";
LaMsg.NAD_liquidPrefImapSearchFoldersEnabled = "Show IMAP search folders";

LaMsg.NAD_UserServicesEnabled = "Email Service";
LaMsg.NAD_Enabled = "Enabled";
LaMsg.NAD_Disabled = "Disabled";
LaMsg.NAD_Enable = "Enable";
LaMsg.NAD_Disable = "Disable";
LaMsg.NAD_Auto = "auto";
LaMsg.NAD_DomainsAuthStr = "expansions for bind DN string:<br>%n = username with @ (or without, if no @ was specified)<br>%u = username with @ removed<br>%d = domain as foo.com<br>%D = domain as dc=foo,dc=com";
LaMsg.NAD_ZERO_UNLIMETED = "(Note: Use \"0\" to specify \"unlimited\" value)";

LaMsg.TABT_GeneralPage = "General Information";
LaMsg.TABT_ContactInfo="Contact Information";
LaMsg.TABT_Aliases = "Aliases";
LaMsg.TABT_Forwarding =	"Forwarding";
LaMsg.TABT_Preferences = "Preferences";
LaMsg.TABT_Features = "Features";
LaMsg.TABT_Advanced = "Advanced";
LaMsg.TABT_InData="Inbound Message Volume";
LaMsg.TABT_InMsgs="Inbound Message Count";
LaMsg.TABT_Disk="Disk Usage";
LaMsg.TABT_ServerPool="Server Pool";
LaMsg.TABT_DomainConfigComplete="Domain Configuration Complete";
LaMsg.NAD_AccountAliases = "Define email aliases for the new account. Use '+' / '-' buttons to add/remove aliases.";
LaMsg.NAD_AccountForwarding = "Forward a copy of email to these addresses. Use '+' / '-' buttons to add/remove addresses.";

LaMsg.TABT_GALMode = "Global Address List (GAL) Mode";
LaMsg.TABT_GALonfiguration = "GAL Settings";
LaMsg.TABT_GALonfigSummary = "GAL Settings Summary";
LaMsg.TABT_TestGalConfig = "Testing GAL Settings";
LaMsg.TABT_GalTestResult = "GAL Test Result";
LaMsg.TABT_AuthMode = "Authentication Mode";
LaMsg.TABT_AuthSettings = "Authentication Settings";
LaMsg.TABT_AuthSettingsSummary = "Authentication Settings Summary";
LaMsg.TABT_TestAuthSettings = "Testing Authentication Settings";
LaMsg.TABT_AuthTestResult = "Authentication Test Result";

LaMsg.ACCOUNT_STATUS_ACTIVE = "Active";
LaMsg.ACCOUNT_STATUS_MAINTENANCE = "Maintanance";
LaMsg.ACCOUNT_STATUS_LOCKED = "Locked";
LaMsg.ACCOUNT_STATUS_CLOSED = "Closed";

LaMsg.NCD_NewAccTitle = "New Account";
LaMsg.NCD_Title = "Create New Class Of Service";
LaMsg.NCD_Name = "Name";
LaMsg.NCD_Description = "Description";
LaMsg.NCD_MailQuota = "Mail Quota in MB";

LaMsg.NDD_Title = "Create New Domain";
LaMsg.NDD_Name = "Name";
LaMsg.NDD_Description = "Description";

LaMsg.CHNP_Title = "Change Password";

LaMsg.NCD_AuthConfigTitle = "Authentication Configuration Wizard";
LaMsg.NCD_GALConfigTitle = "GAL Configuration Wizard";
LaMsg.Restore_WizTitle = "Mailbox Restore Wizard";

LaMsg.ERROR_EMAIL_ADDR_REQUIRED = "Email address is required in order to restore a mailbox!";
LaMsg.ERROR_SESSION_EXPIRED = "Your Session Has Expired";
LaMsg.SERVER_ERROR = "Server error encountered";
LaMsg.SOAP_ERROR = "SOAP error encountered";
LaMsg.NETWORK_ERROR = "Network error encountered";
LaMsg.PARSE_ERROR = "Parse error encountered";
LaMsg.PERMISSION_DENIED = "Error: permission denied"
LaMsg.JAVASCRIPT_ERROR = "JavaScript error encountered";
LaMsg.ERROR_AUTH_FAILED = "Authentication Failed";
LaMsg.ERROR_AUTH_NO_ADMIN_RIGHTS = "User does not have administrator rights";
LaMsg.ERROR_INVALID_VALUE = "Invalid Value";
LaMsg.ERROR_MAX_MIN_PWDLENGTH = "Value of \"Minimum Password Length\" cannot be greater than value of \"Maximum Password Length\"";
LaMsg.ERROR_MAX_MIN_PWDAGE = "Value of \"Minimum Password Age\" cannot be greater than value of \"Maximum Password Age\"";
LaMsg.ERROR_UNKNOWN = "Unknown error!";
LaMsg.ERROR_PASSWORD_REQUIRED = "Must specify a password!";
LaMsg.ERROR_PASSWORD_MISMATCH = "Passwords do not match!";
LaMsg.ERROR_PASSWORD_TOOLONG = "Password is too long";
LaMsg.ERROR_PASSWORD_TOOSHORT = "Password is too short";
LaMsg.ERROR_PASSWORD_INVALID = "Password is invalid";
LaMsg.ERROR_NAME_REQUIRED = "Must specify a name!";

LaMsg.ERROR_ACCOUNT_NAME_REQUIRED = "Must specify an account name!";
LaMsg.ERROR_ACCOUNT_LAST_NAME_REQUIRED = "Must specify a last name!";
LaMsg.ERROR_ACCOUNT_NAME_INVALID = "The specified account name is invalid.";
LaMsg.FAILED_ADD_ALIASES = "Failed to add Aliases. ";
LaMsg.WARNING_ALIAS_EXISTS = "Cannot add alias, because an account with the same name as the specified alias already exists: ";
LaMsg.WARNING_ALIASES_EXIST = "Cannot add aliases, accounts with the same names as the specified aliases already exist: ";
LaMsg.ERROR_ACCOUNT_EXISTS = "The specified account already exists. Please choose another name.";
LaMsg.ERROR_COS_EXISTS = "The specified Class of service already exists. Please choose another name.";
LaMsg.ERROR_COS_NAME_TOOLONG = "The specified Class of service name is too long.";
LaMsg.ERROR_DOMAIN_EXISTS = "The specified domain already exists.";
LaMsg.ERROR_DOMAIN_NAME_TOOLONG = "The specified domain name is too long.";
LaMsg.ERROR_DOMAIN_NAME_INVALID = "The specified domain name is invalid.";
LaMsg.ERROR_DOMAIN_NAME_REQUIRED = "A valid domain name is required.";
LaMsg.ERROR_DOMAIN_NOT_EMPTY = "Cannot delete the domain, because it is not empty. Please remove all the accounts from the domain first.";
LaMsg.ERROR_WRONG_HOST = "Command sent to the wrong host.";
LaMsg.ERROR_NO_SUCH_ACCOUNT = "No such account."

LaMsg.FAILED_RENAME_ACCOUNT_1 = "Failed to rename account. Another account with the specified name already exists. <br>Please choose another name.";
LaMsg.FAILED_RENAME_ACCOUNT = "Failed to rename account.";
LaMsg.FAILED_CREATE_ACCOUNT_1 = "Failed to create account. The specified account already exists. <br>Please choose another name.";
LaMsg.FAILED_CREATE_ACCOUNT = "Failed to create account.";
LaMsg.FAILED_SAVE_ACCOUNT = "Failed to save the changes to the account.";

LaMsg.FAILED_RENAME_COS_1 = "Failed to rename COS. Another COS with the specified name already exists. <br>Please choose another name.";
LaMsg.FAILED_RENAME_COS = "Failed to rename COS.";
LaMsg.FAILED_CREATE_COS_1 = "Failed to create COS. COS with this name already exists. <br>Please choose another name.";
LaMsg.FAILED_CREATE_COS = "Failed to create COS.";
LaMsg.FAILED_SAVE_COS = "Failed to save the changes to the COS.";

LaMsg.ERROR_RESTORE_1 = "Cannot restorer accounts. Prefix parameter is required when restoring a mailbox into a new account.";
LaMsg.ERROR_RESTORE_2 = "Cannot restorer accounts, because argument 'accounts' is missing or null.";
LaMsg.ERROR_RESTORE_3 = "Cannot restorer accounts, because argument 'method' is missing or null.";

LaMsg.ERROR_BACKUP_1 = "Cannot query backup labels for accounts, because argument 'accounts' is missing or null.";

LaMsg.Q_DELETE_ACCOUNTS ="Are you sure you want to delete these accounts: ";
LaMsg.Q_DELETE_ALIASES ="Are you sure you want to delete these aliases:";
LaMsg.Q_DELETE_DOMAINS ="Are you sure you want to delete these domains:";
LaMsg.Q_DELETE_COS ="Are you sure you want to delete these classes of service:";
LaMsg.Q_SAVE_CHANGES="Do you want to save current changes?";
LaMsg.Q_DELETE_SERVERS="Deleting a server will remove the server entry from LDAP. <br>You should do this only after the server has been removed from your network.<br> Are you sure you want to delete these servers:";

LaMsg.CORRECT_ERRORS = "Please correct the values in these fields:";

LaMsg.attrDesc = 
function(name) {
	var desc = LaMsg.ATTR[name];
	return (desc == null) ? name : desc;
}

/* Translation of  the attribute names to the screen names */
LaMsg.ATTR = new Object();

	LaMsg.ATTR[LaAccount.A_accountName] = "Full Name";
	LaMsg.ATTR[LaAccount.A_description] = "Description";
	LaMsg.ATTR[LaAccount.A_firstName] = "First Name";
	LaMsg.ATTR[LaAccount.A_lastName] =  "Last Name",
	LaMsg.ATTR[LaAccount.A_accountStatus] =  "Account Status",
	LaMsg.ATTR[LaItem.A_liquidId] =  "Id",	
	LaMsg.ATTR[LaAccount.A_mailHost] =  "Mail Server",
	LaMsg.ATTR[LaAccount.A_liquidMailQuota] =  "Mail Quota",
	LaMsg.ATTR[LaAccount.A_notes] =  "Notes"

LaMsg.accountStatus = 
function(val) {
	var desc = LaMsg.ACCOUNT_STATUS[val];
	return (desc == null) ? val : desc;
}

/* Translation of Account status values into screen names */
LaMsg.ACCOUNT_STATUS = new Object ();
	LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_ACTIVE] = "Active",
	LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_MAINTENANCE] = "Maintenance",
	LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_LOCKED] = "Locked",
	LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_CLOSED] = "Closed"


LaMsg.mailStatus = 
function(name) {
	var desc = LaMsg.ACCOUNT_STATUS[name];
	return (desc == null) ? name : desc;
}


LaMsg.GALModes = new Object();
LaMsg.GALModes[LaDomain.GAL_Mode_internal]="Internal";
LaMsg.GALModes[LaDomain.GAL_Mode_external]="External";
LaMsg.GALModes[LaDomain.GAL_Mode_both]="Both";

LaMsg.AuthMechs = new Object();
LaMsg.AuthMechs[LaDomain.AuthMech_ldap] = "LDAP";
LaMsg.AuthMechs[LaDomain.AuthMech_Liquid]="Liquid";



LaMsg.STANDALONE = "Standalone";
LaMsg.MASTER = "Master";
LaMsg.SLAVE = "Slave";

LaMsg.adminGuide = "Admin Guide";
LaMsg.help = "Help";
LaMsg.migrationWiz = "Migration Wizard";
LaMsg.logOff = "Log Off";
LaMsg.done = "Done";
LaMsg.searchForAccounts = "Search for accounts";
LaMsg.search = "Search For Accounts";
LaMsg.queryParseError = "Unable to parse your search query. Please correct any errors and resubmit.";
LaMsg.liquidAdminTitle = "Liquid Mail Administration";
LaMsg.usedQuota = "Used quota";
LaMsg.login = " Log On ";
LaMsg.loginHeader = "Zimbra Mail Administration Console";
LaMsg.username = "Username";
LaMsg.password = "password";
LaMsg.publicComputer = "Public Computer";
LaMsg.enterUsername = "Please enter administrator username and password";