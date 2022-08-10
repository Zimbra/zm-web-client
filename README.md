## zm-web-client
This repository serves as the source for standard and an advanced Zimbra Web Client (Ajax Client).

## Getting Started
To setup a development environment make sure all the prerequisites are in place and then go ahead with build & deploy.

### Steps to build & deploy.
To deploy a production build:
 ```
 ant prod-deploy
 ```
Development target to sync changes:
```
 ant dev-sync
 ```

### Dependencies
These dependencies are resolved through ivy and then used for compilation & packaging into the build output.
- [zm-timezones](https://github.com/Zimbra/zm-timezones)
- [zm-ajax](https://github.com/Zimbra/zm-ajax)
- [zm-taglib](https://github.com/Zimbra/zm-taglib)
- [zm-mailbox](https://github.com/Zimbra/zm-mailbox)
- `ThirdParty Jars` 

### Prerequisites

- Create .zcs-deps folder in home directory
- Clone [zimbra-package-stub](https://github.com/Zimbra/zimbra-package-stub) at same level. 
- Clone [zm-zcs](https://github.com/Zimbra/zm-zcs) at same level. 
- All the dependency repositories are cloned at the same level.
- zm-mailbox, zm-taglib & zm-ajax are built and jar outs are published to ivy.
- ant is available on command line.

NOTE: `zmmailboxdctl restart` will be triggered after deploying zm-web-client instance (jetty restarts after `ant prod-deploy` and `ant dev-sync`).