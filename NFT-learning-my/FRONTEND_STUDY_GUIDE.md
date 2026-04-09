# NFT-C2E Frontend Study Guide

## 1. 学习目标

这份文档的目标不是带你“照抄项目”，而是帮你把这个项目当成一个前端练手样本，自己从头实现一遍前端部分。

建议你的目标分成两层：

- 第一层：能独立重写页面、组件、路由、样式和表单交互
- 第二层：能理解前端如何与钱包、合约、IPFS 元数据协作

你的重点应当放在前端实现上，合约部分以“看懂接口、知道前端怎么调用”为主，不需要自己从头写 Solidity。

## 2. 这个项目的前端在做什么

从前端视角看，这个项目本质上是一个 NFT 市场应用，核心流程只有 4 个：

1. 用户进入市场页，查看所有 NFT
2. 用户点击某个 NFT，进入详情页
3. 用户连接钱包并上架 NFT
4. 用户查看自己拥有的 NFT

对应到页面：

- `/`：市场页 `Marketplace`
- `/sellNFT`：上架页 `SellNFT`
- `/nftPage/:tokenId`：详情页 `NFTPage`
- `/profile`：个人页 `Profile`

## 3. 前端整体结构

### 3.1 路由入口

入口文件是：

- `src/index.js`

它直接使用 `BrowserRouter + Routes + Route` 来组织页面路由。

这个项目里 `App.js` 没有真正承担应用入口职责，真正的页面挂载逻辑在 `index.js` 中。

### 3.2 组件划分

主要组件如下：

- `src/components/Navbar.js`
  负责顶部导航、连接钱包、显示当前地址
- `src/components/NFTTile.js`
  负责单个 NFT 卡片展示
- `src/components/Marketplace.js`
  负责获取并展示 NFT 列表
- `src/components/NFTpage.js`
  负责单个 NFT 详情和购买逻辑
- `src/components/Profile.js`
  负责展示当前钱包拥有的 NFT
- `src/components/SellNFT.js`
  负责 NFT 上架表单、图片上传、元数据上传和调用合约创建 NFT

### 3.3 工具与配置

- `src/utils.js`
  负责 IPFS URL 转换
- `src/pinata.js`
  负责调用 Pinata API 上传图片和 JSON
- `src/Marketplace.json`
  负责提供合约地址和 ABI
- `tailwind.config.js`
  Tailwind 配置
- `config-overrides.js`
  为 CRA 补浏览器端需要的 Node polyfill

## 4. 推荐你先掌握的前端知识点

如果你准备自己从头写一遍，建议先补稳这些内容：

- React 函数组件
- `useState`
- `useEffect`
- React Router v6
- 受控表单
- 列表渲染
- 条件渲染
- 组件拆分与 props
- 异步请求与加载状态
- Tailwind CSS 基础类名

Web3 相关只需要先掌握这些最小集合：

- `window.ethereum`
- `ethers.providers.Web3Provider`
- `signer`
- `new ethers.Contract(address, abi, signer)`
- 合约只读调用
- 合约写操作与 `transaction.wait()`

## 5. 建议的重写顺序

不要一上来就连钱包和合约。最顺的学习方式是“先把纯前端做起来，再逐步接 Web3”。

### 第 1 步：先搭项目骨架

先自己新建一套最小结构：

- `pages/Marketplace.jsx`
- `pages/SellNFT.jsx`
- `pages/NFTPage.jsx`
- `pages/Profile.jsx`
- `components/Navbar.jsx`
- `components/NFTCard.jsx`

先把路由配通，让页面能切换。

目标：

- 不依赖链上数据
- 页面能正常跳转
- 导航栏能正常高亮当前路由

### 第 2 步：用假数据实现市场页

先不要从合约读取 NFT，直接写一个本地数组，例如：

- `id`
- `name`
- `description`
- `image`
- `price`

先完成：

- NFT 卡片列表
- 卡片点击跳详情页
- 详情页显示完整信息

这一阶段你重点练的是：

- 列表渲染
- props 传递
- 动态路由参数
- 页面布局

### 第 3 步：实现公共 UI

把以下部分做成稳定的公共组件：

- 导航栏
- NFT 卡片
- 页面标题区
- 表单输入项

这一阶段重点练：

- 组件复用
- props 设计
- 样式复用

### 第 4 步：接入钱包连接

先只做：

- 点击按钮连接钱包
- 显示钱包地址
- 判断当前链是否正确

这一阶段你只需要让 `Navbar` 能工作，不要急着把所有页面都接上合约。

### 第 5 步：接入市场页真实数据

再开始接合约：

1. 获取合约实例
2. 调用 `getAllNFTs`
3. 拿到每个 NFT 的 `tokenURI`
4. 请求 metadata
5. 组装前端需要的数据结构
6. 渲染到卡片列表

这一阶段是整个项目最关键的一步，因为你会真正理解：

- 链上返回的是什么
- 前端页面真正用的是什么
- 为什么还要再去 IPFS 拉 metadata

### 第 6 步：接入详情页购买逻辑

在详情页完成：

- 读取指定 tokenId 的数据
- 显示 owner、seller、price
- 点击按钮调用购买函数
- 处理 loading 和提示文案

### 第 7 步：接入上架页

这是流程最长的一个页面：

1. 用户填写名称、描述、价格
2. 上传图片到 IPFS
3. 生成 metadata JSON
4. 上传 metadata 到 IPFS
5. 调用合约创建 NFT

这一步会同时练到：

- 表单处理
- 文件上传
- 异步状态切换
- 提交按钮禁用
- 成功失败提示

### 第 8 步：接入个人页

最后做个人页，因为它和市场页的渲染逻辑很像，复用度很高。

## 6. 你在每个文件里应该重点看什么

### `src/index.js`

重点看：

- React 应用如何挂载
- 路由是怎么定义的
- 动态路由参数如何写

你自己重写时建议：

- 把路由移到 `App.js`，结构会更常见、更清晰

### `src/components/Navbar.js`

重点看：

- 如何连接 MetaMask
- 如何读取当前地址
- 如何监听账户切换
- 如何根据当前路径高亮导航

但这个文件里有几个做法不建议直接照搬：

- 直接用 `document.querySelector` 改按钮样式
- 直接操作 DOM class
- 用 `window.location.replace` 刷新页面

你自己重写时建议：

- 用 React state 控制按钮文案和样式
- 用 `useNavigate` 或组件状态更新替代整页刷新
- 把钱包状态单独收进 hook 或 context

### `src/components/NFTTile.js`

重点看：

- 一个卡片组件最小需要哪些字段
- 如何从列表页跳到详情页
- IPFS 图片地址如何转换后展示

你自己重写时建议：

- 直接解构 props，如 `function NFTCard({ nft })`
- 控制描述长度，避免卡片高度不一致
- 把价格也显示在卡片里，信息更完整

### `src/components/Marketplace.js`

重点看：

- 获取 NFT 列表的完整流程
- `Promise.all` 如何并发拉取 metadata
- 如何把链上数据映射成前端数据

这个页面最值得你学习的数据流是：

1. 调合约拿列表
2. 遍历 token
3. 根据 `tokenURI` 拉 metadata
4. 组装成页面可用对象
5. 渲染组件

你自己重写时建议：

- 用 `useEffect` 触发请求，不要在组件函数体内直接调用
- 增加 `loading`、`error`、`empty` 三种状态
- 把“获取 NFT 列表”的逻辑抽成单独函数或 service

### `src/components/NFTpage.js`

重点看：

- 如何通过路由参数拿到 `tokenId`
- 如何获取单个 NFT 详情
- 如何执行购买交易

你自己重写时建议：

- 使用 `useEffect` 请求详情数据
- 不要直接修改 `data.image`
- 增加交易中的禁用状态
- 购买成功后刷新当前数据或跳转，而不是只弹窗

### `src/components/Profile.js`

重点看：

- 如何查询“我的 NFT”
- 如何复用卡片组件
- 如何统计总价值

你自己重写时建议：

- 不要用 `useParams`，因为这个页面并没有实际路由参数
- 同样改成 `useEffect`
- metadata 获取时统一做 IPFS 处理

### `src/components/SellNFT.js`

重点看：

- React 表单状态管理
- 图片上传流程
- metadata 生成流程
- 合约写入流程

这是最适合你认真手敲一遍的页面，因为它最能练前端能力。

你自己重写时建议重点优化：

- 按钮禁用用 state，不要用 DOM API
- 上传中、提交中状态分开管理
- 表单校验更明确
- 文件上传后增加图片预览
- 成功提示和失败提示做得更清晰

## 7. 当前项目中不建议直接照搬的地方

这个项目适合学习，但它更像“课程/练手项目”，不是一个特别标准的工程化前端。

下面这些地方你最好理解后再重写，不要原样复制：

### 7.1 在组件渲染过程中发请求

例如：

- `Marketplace.js`
- `NFTpage.js`
- `Profile.js`

都用了类似：

```js
if (!dataFetched) getData();
```

这在 React 里不够稳妥。你自己写时要改成：

```js
useEffect(() => {
  getData();
}, []);
```

### 7.2 直接操作 DOM

例如按钮状态是这样改的：

- `document.querySelector`
- `getElementById`
- 手动改 `style`

React 更推荐：

- 用 `isLoading`
- 用 `isConnected`
- 用 `disabled={...}`
- 用条件 `className`

### 7.3 页面依赖整页刷新

项目里有 `window.location.replace(...)`。

你自己重写时更推荐：

- 用组件状态刷新视图
- 用路由跳转
- 必要时重新拉数据

### 7.4 Web3 逻辑分散在各页面

目前每个页面都在重复：

- 创建 provider
- 获取 signer
- 创建 contract

建议你重写时抽成：

- `src/lib/contract.js`
- `src/lib/wallet.js`
- `src/services/nft.js`

## 8. 一份更适合你重写时使用的目录结构

如果你自己从头写，我建议用比原项目更清楚的结构：

```text
src/
  app/
    router.jsx
  pages/
    Marketplace.jsx
    SellNFT.jsx
    NFTDetail.jsx
    Profile.jsx
  components/
    Navbar.jsx
    NFTCard.jsx
    Loading.jsx
    EmptyState.jsx
  hooks/
    useWallet.js
    useMarketplace.js
  lib/
    contract.js
    ipfs.js
  services/
    nftService.js
    pinataService.js
  config/
    contract.js
  styles/
    globals.css
  App.jsx
  main.jsx
```

这套结构的好处是：

- 页面职责更清楚
- Web3 逻辑不散落
- 后续重构更容易

## 9. 一套建议你亲手实现的数据流

下面是你重写时最好自己亲手梳理一遍的数据流。

### 9.1 市场页数据流

```text
页面挂载
-> 获取合约实例
-> 调用 getAllNFTs()
-> 遍历每个 NFT
-> 获取 tokenURI
-> 请求 metadata
-> 转换为前端对象
-> setState
-> 渲染卡片
```

### 9.2 详情页数据流

```text
读取 tokenId
-> 获取合约实例
-> 调用 tokenURI(tokenId)
-> 调用 getListedTokenForId(tokenId)
-> 请求 metadata
-> 合并为详情对象
-> 渲染页面
```

### 9.3 上架页数据流

```text
用户填写表单
-> 上传图片到 Pinata
-> 拿到图片 URL
-> 生成 metadata JSON
-> 上传 metadata 到 Pinata
-> 拿到 metadata URL
-> 调用 createToken(metadataURL, price)
-> 等待交易完成
-> 跳回市场页
```

## 10. 你可以按什么标准检查自己有没有真正学会

如果你已经能独立完成下面这些事，就说明你不是在“照着抄”，而是真的学到了：

- 不看原项目，也能自己把路由搭出来
- 不看原项目，也能自己写出 NFT 卡片组件
- 能解释 `tokenURI` 和 metadata 的关系
- 能解释为什么要从 IPFS 再拉一次 JSON
- 能独立写出连接钱包按钮
- 能自己处理 `loading / error / empty` 三种页面状态
- 能把合约调用逻辑抽到单独文件
- 能指出原项目里哪些写法不够 React 化

## 11. 最推荐你投入时间的页面

如果你的时间有限，优先级建议如下：

### 第一优先级

- `SellNFT`
- `Marketplace`

原因：

- 这两个页面最能练前端核心能力
- 一个偏表单与提交
- 一个偏列表与异步获取

### 第二优先级

- `Navbar`
- `NFTTile`

原因：

- 能练组件拆分和复用
- 也是后面所有页面的基础

### 第三优先级

- `NFTPage`
- `Profile`

原因：

- 逻辑并不难
- 更像是在前两个页面基础上的延伸

## 12. 一份适合你执行的练习计划

### 第 1 天

- 看懂项目路由结构
- 自己新建页面和导航栏
- 用假数据完成市场页和详情页跳转

### 第 2 天

- 重写 NFT 卡片和导航栏
- 完成页面样式
- 完成个人页静态版

### 第 3 天

- 接入钱包连接
- 显示地址
- 处理链切换

### 第 4 天

- 接入市场页真实数据
- 理解 tokenURI、metadata、IPFS

### 第 5 天

- 实现详情页购买
- 实现个人页读取

### 第 6 天

- 实现上架页完整流程
- 完成表单校验和上传状态

### 第 7 天

- 做一次自己的重构
- 把 web3 逻辑抽离
- 把页面状态补完整

## 13. 最后给你的学习建议

你现在最适合的方式不是“逐行背代码”，而是：

1. 先理解页面职责
2. 再自己搭框架
3. 用假数据把页面先做通
4. 最后再逐步接链上逻辑

这样你会更像一个在做真实前端项目的人，而不是在跟着教程机械复制。

尤其要注意一件事：

这个项目真正值得你学的，不只是“怎么把 NFT 显示出来”，而是“前端如何组织一个包含页面、组件、异步请求、表单、路由和外部系统交互的小项目”。

如果你把这个项目前端独立重写一遍，再顺手做一点结构优化，你的收获会比单纯照敲大很多。

## 14. 建议你下一步立刻做什么

现在最推荐你直接开始做这三件事：

1. 自己新建一个前端目录结构
2. 先不接链，先写市场页和卡片组件
3. 写完以后再对照原项目补钱包连接和数据获取

如果你愿意，下一步我可以继续帮你做两件很实用的事中的一个：

- 给你再生成一份“按文件逐个学习”的 checklist
- 直接帮你列一份“你自己从头重写前端”的开发步骤清单
