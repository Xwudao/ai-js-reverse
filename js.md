https://pan.xunlei.com/s/VOU-iUe7-r8L6aK7xJ4dMOzgA1?origin=lpss&pwd=2kes

迅雷分享 接口有 

1. https://xluser-ssl.xunlei.com/v1/shield/captcha/init
2. https://api-pan.xunlei.com/drive/v1/share?share_id=VOU-iUe7-r8L6aK7xJ4dMOzgA1&pass_code=2kes&limit=100&pass_code_token=&page_token=&params=%7B%22origin%22%3A%22lpss%22%7D&thumbnail_size=SIZE_SMALL


```
{"client_id":"Xqp0kJBXWhwaTpB6","action":"get:/drive/v1/share","device_id":"ce8b565a93e31878b5de6a35764de478","meta":{"username":"","phone_number":"","email":"","package_name":"pan.xunlei.com","client_version":"1.92.37","captcha_sign":"1.baef9f836a5b8188ce3c899f1d32a7ee","timestamp":"1774405676725","user_id":"0"}}
```

有如上payload，其中需要逆向出captcha_sign的算法，请通过playwright mcp工具还你自己知识库，帮我实现纯node/python/go算法实现（优先node,其次go，先实现一种）