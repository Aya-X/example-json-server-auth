# example-json-server-auth

- `CKEditor` 編輯器串接圖庫
  - 來源感謝 `WeiJ` 大大：
    - <https://github.com/Aya-X/example-json-server-auth/pull/6>
  - 申請：
    - <https://github.com/WeiJ0/imgurl-token-get>

## PAGES

- <https://try-json-server-a.koyeb.app>
  - 暫時

- <https://play-json-server-auth.herokuapp.com>
  - 已停止

- <https://gpp2p2-3000.sse.codesandbox.io>
  - 不穩定，偶爾 `502-Bad`

---

## 概要

- 目前使用的檔案

```markdown
.
├── data/
│   └── db.json    // 資料集合
├── server.js    // json-server

└── public/    // 前端網頁畫面
    ├── index.html    // 首頁
    ├── login.html    // 登入頁
    ├── register.html    // 註冊頁
    ├── me/
    │   └── bookmarks.html    // 使用者收藏列表

    ├── admin/    // 【後台】
    │   ├── desk.html    // 【後台】列表
    │   └── posts/
    │       ├── create.html    // 【後台】新增文章
    │       └── editor.html    // 【後台】編輯文章
    
    └── helpers/
        ├── renderUserMenu.js    // 前台判斷、顯示導覽列
        └── uploadAdpter.js    // 【後台】編輯器串接圖庫
```

### helpers/renderUserMenu.js

- index.html、bookmarks.html 共用登入判斷

- 用瀏覽器資料去 `getUser` 來確認登入狀態  
  - 若無法取得就清空瀏覽器
  - 代表 `token` 錯誤或過期了

- 用回傳的 `user.role` 字串判斷是否為管理員
  - 幫管理員顯示後台連結

### index.html

- 同時取得全部文章、連動收藏列表

```js
- GET

/api/posts?_embed=bookmarks
```

- 加入收藏

```js
- POST

/api/bookmarks

const data = {
  postId
};
```

- 移除收藏

```js
- DELETE

/api/bookmarks/${bookmarkId}
```

### me/bookmarks.html

- 只取得使用者自己的收藏列表、該篇文章內容

```js
- GET

const url = `/api/users/${userId}/bookmarks?_expand=post`;
```

### 後端路由

- 【文章系列】：`/api/posts`

- 【使用者系列】：`/api/users`

- 每筆新增資料會有自己的 `id`，由套件自行產生數字

> - 不確定能否改用 uuid() 去蓋掉

- 權限通過後，`JSON-Server-auth`會自動回傳 `accessToken`、`user.id`、`user.email` 的使用者資料
  - 前端需將 `accessToken` 存入 `localStorage`
  - 並在發送請求前取出來，經由 API 傳給後端

```JSON
{
  "accessToken": "...",
  "user": {
    "email": "example@mail",
    "id": 2
  }
}
```

- `server.js` 已增加自訂判斷
  - 收到 `POST` 方法後會將前端傳來的 `accessToken` 解碼
  - 解碼後將 `userId` 存回資料

---

## 預備知識

- VSCode

  - `Live Server`

- 終端機

  - 指令

- NPM

---

## Started

### Step0-1

- 準備電腦放專案的目錄（Windows 系統盡量都英文），範例路徑：

```shell
D:\projects
```

### Step0-2

- 打開終端機，路徑指向專案目錄
  - （Windows 系統可以直接在檔案總管的網址列輸入 `CMD`）

### Step1

- 抓下來

```shell
git clone https://github.com/Aya-X/example-json-server-auth.git
```

### Step2

- 安裝套件

```shell
npm install
```

### Step3

- 執行

```shell
npm run start
```

### Step4

- 本機端預設網址

```shell
http://localhost:3000/
```

- `PORT:3000` 可以在 `server.js` 調整

- `JSON-Server` 會自動開啟 `<public>/index.html` 作為同網域的頁面

```shell

```

<!-- - 開分支 -->

## 分支說明

### main

- 【版本】：已合併 `JSON-server`、`JSON-Server-auth`

- 【初始版本】：commit `fefeb0580b`

  - 由 `CodeSandbox` 的 `JSON-SERVER-STARTER` 修改而來

- 原版網頁移動至 `<public>/<example>` 底下
  - 原版資料集：`<data>/sample.json`

---

## Package

### Mock-Server

- nodemon
- json-server
- json-server-auth
- jwt-decode

### 前端

> 跳過編譯工具，先全部使用 `CDN` 匯入

- Bootstrap5

  - CSS
  - JS

- axios

- CKEditor-v5
