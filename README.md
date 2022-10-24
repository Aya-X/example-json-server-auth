# example-json-server-auth

## TODO

- [ ] `CKEditor` 編輯器還吃不到圖片

## PAGES

> Created with CodeSandbox

- <https://gpp2p2-3000.sse.codesandbox.io>
  - 不穩定，偶爾 `502-Bad`

---

## 概要

### 前端網址

#### 前台

- 【首頁】：`index.html`

#### 後台

- 【後台首頁】：`/admin/index.html`

- 【註冊】：`/admin/signup.html`
- 【登入】：`/admin/login.html`

- 【主控台】：`/admin/desk.html`

- 【新增文章】：`/admin/posts/create.html`
- 【編輯文章】：`/admin/posts/editor.html`

---

### 後端路由

- 【文章系列】：`/api/posts`

- 【使用者系列】：`/api/users`

- 【權限】
  - 註冊：`/signup`
  - 登入：`/login`

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

### feature_json-server

- 【版本】：顯示自訂資料到前台畫面上

- 資料：`<data>/db.json`

- resource：`posts`

- 路由：`/api/posts`

- 前台網頁：`<public>/index.html`

---

### feature_json-server-auth

- 【版本】：加入 auth 權限

- resource：`users`  

- 註冊路由：`/signup`

- 登入路由：`/login`

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

#### Bootstrap5

- 版型來源：

  - <https://bootstrap5.hexschool.com/docs/5.1/examples/sticky-footer-navbar/>

- 首頁卡片列表：

  - <https://bootstrap5.hexschool.com/docs/5.1/components/card/>

- 後台入口：

  - <https://bootstrap5.hexschool.com/docs/5.1/forms/form-control/>

- 儀錶板表格：

  - <https://bootstrap5.hexschool.com/docs/5.1/content/tables/>

- 按鈕：
  - <https://bootstrap5.hexschool.com/docs/5.1/components/buttons/>

---
