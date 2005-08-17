function LaSettings() {
}
LaSettings.CSFE_SERVER_URI = (location.port == "80") ? "/service/admin/soap/" : ":" + location.port + "/service/admin/soap/";
LaSettings.CSFE_MSG_FETCHER_URI = (location.port == "80") ? "/service/content/get?" : ":" + location.port + "/service/content/get?";
LaSettings.CONFIG_PATH = "/liquidAdmin/js/liquidAdmin/config";
