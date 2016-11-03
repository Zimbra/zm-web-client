## Steps to build & deploy.
 - ant deploy
 Or
 - ant prod-deploy

## Dependencies
- `zm-timezones`
- `zm-ajax`
- `zm-taglib`
- `zm-soap`
- `zm-store`
- `zm-client`
- `zm-common`
- 'ThirdParty Jars'

## Build Pre-requisite
- create .zcs-deps folder in home directory
- clone zimbra-package-stub at same level: git clone https://github.com/Zimbra/zimbra-package-stub.git 
- clone zm-zcs at same level: git clone ssh://git@stash.corp.synacor.com:7999/zimbra/zm-zcs.git 
- clone zm-timezones & zm-ajax.
- zm-ajax is built already.
- copy following jars in the .zcs-deps folder:
    - `ant-contrib-1.0b1.jar`

NOTE: `zmmailboxdctl restart` will be triggered after deploying zm-web-client instance (jetty restarts after `ant prod-deploy`, `ant dev-sync` and `ant deploy`).