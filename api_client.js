window.MUREA_CONFIG={"apiBase": "https://qlz-system-product-name.tailad926a.ts.net"};
/* Same-origin locally; the Pages build supplies only a public HTTPS API URL. */
window.MUREA_CONFIG=window.MUREA_CONFIG||{};
const apiOrigin=(window.MUREA_CONFIG.apiBase||'').replace(/\/$/,'');
if(apiOrigin&&!/^https:\/\//.test(apiOrigin)&&!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(apiOrigin))throw Error('后台地址必须使用 HTTPS');
window.hciApiURL=path=>apiOrigin+path;
