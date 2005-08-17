function LsCsfeException(msg, code, method, detail) {
	if (arguments.length == 0) return;
	LsException.call(this, msg, code, method, detail);
}

LsCsfeException.prototype = new LsException;
LsCsfeException.prototype.constructor = LsCsfeException;

LsCsfeException.prototype.toString = 
function() {
	return "LsCsfeException";
}

LsCsfeException.CSFE_SVC_ERROR 				= "CSFE_SVC_ERROR";
LsCsfeException.NETWORK_ERROR 				= "NETWORK_ERROR";
LsCsfeException.NO_AUTH_TOKEN 				= "NO_AUTH_TOKEN";
LsCsfeException.SOAP_ERROR 					= "SOAP_ERROR";

// CSFE Exceptions
LsCsfeException.SVC_AUTH_EXPIRED 			= "service.AUTH_EXPIRED";
LsCsfeException.SVC_AUTH_REQUIRED 			= "service.AUTH_REQUIRED";
LsCsfeException.SVC_FAILURE 				= "service.FAILURE";
LsCsfeException.SVC_INVALID_REQUEST 		= "service.INVALID_REQUEST";
LsCsfeException.SVC_PARSE_ERROR 			= "service.PARSE_ERROR";
LsCsfeException.SVC_PERM_DENIED 			= "service.PERM_DENIED";
LsCsfeException.SVC_UNKNOWN_DOCUMENT 		= "service.UNKNOWN_DOCUMENT";
LsCsfeException.SVC_WRONG_HOST 				= "service.WRONG_HOST";

LsCsfeException.ACCT_AUTH_FAILED 			= "account.AUTH_FAILED";
LsCsfeException.ACCT_EXISTS 				= "account.ACCOUNT_EXISTS";
LsCsfeException.ACCT_INVALID_PASSWORD 		= "account.INVALID_PASSWORD";
LsCsfeException.ACCT_INVALID_PREF_NAME 		= "account.INVALID_PREF_NAME";
LsCsfeException.ACCT_INVALID_PREF_VALUE 	= "account.INVALID_PREF_VALUE";
LsCsfeException.ACCT_NO_SUCH_ACCOUNT 		= "account.NO_SUCH_ACCOUNT";
LsCsfeException.ACCT_NO_SUCH_SAVED_SEARCH 	= "account.NO_SUCH_SAVED_SEARCH";
LsCsfeException.ACCT_NO_SUCH_TAG 			= "account.ACCT_NO_SUCH_TAG";
LsCsfeException.ACCT_PASS_RECENTLY_USED 	= "account.PASSWORD_RECENTLY_USED";
LsCsfeException.DOMAIN_NOT_EMPTY			= "account.DOMAIN_NOT_EMPTY";

LsCsfeException.COS_EXISTS 					= "account.COS_EXISTS";

LsCsfeException.DOMAIN_EXISTS 				= "account.DOMAIN_EXISTS";

LsCsfeException.MAIL_INVALID_NAME 			= "mail.INVALID_NAME";
LsCsfeException.MAIL_NO_SUCH_FOLDER 		= "mail.NO_SUCH_FOLDER";
LsCsfeException.MAIL_NO_SUCH_TAG 			= "mail.NO_SUCH_TAG";
LsCsfeException.MAIL_NO_SUCH_CONV 			= "mail.NO_SUCH_CONV";
LsCsfeException.MAIL_NO_SUCH_MSG 			= "mail.NO_SUCH_MSG";
LsCsfeException.MAIL_NO_SUCH_PART 			= "mail.NO_SUCH_PART";
LsCsfeException.MAIL_QUOTA_EXCEEDED 		= "mail.QUOTA_EXCEEDED";
LsCsfeException.MAIL_QUERY_PARSE_ERROR 		= "mail.QUERY_PARSE_ERROR";
