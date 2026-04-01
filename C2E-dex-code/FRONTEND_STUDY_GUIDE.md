# C2E Dex Frontend Study Guide

## 1. 学习目标

这份文档的目标不是带你“照抄项目”，而是帮你把这个项目当成一个前端练手样本，自己从头实现一遍前端部分。

你的重点建议放在这两层：

- 第一层：能独立重写页面、组件、路由、样式和表单交互
- 第二层：能理解前端如何连接钱包、切网络、读写合约、对接后端签名接口

合约部分你不需要自己从头敲 Solidity，但至少要做到：

- 看懂前端调用了哪些合约方法
- 知道这些方法的输入输出是什么
- 知道前端什么时候该调只读方法，什么时候该发交易

## 2. 这个项目的前端在做什么

这个仓库前端目录是：

- `c2n-fe`

从前端视角看，它主要包含 3 类业务：

1. `Stake`
   用户连接钱包后质押代币，参与后续 IDO
2. `IDO / Project`
   用户查看项目详情、注册、购买、提取
3. `Dex`
   用户做 Swap、Add Liquidity、Remove Liquidity

如果你的目标是“自己从头敲一遍前端”，最推荐的学习顺序不是按页面数量，而是按业务复杂度：

1. 先做应用壳子
2. 再做钱包连接
3. 再做 `Stake`
4. 再做 `Swap / Liquidity`
5. 最后再碰 `Project / IDO`

## 3. 技术栈总览

从 `c2n-fe/package.json` 看，这个项目前端是典型的老一代 Web3 React 技术栈：

- `Next.js 12`
- `React 17`
- `TypeScript`
- `ethers v5`
- `@web3-react/core`
- `Redux`
- `Ant Design`
- `Sass / SCSS`

这套栈现在不算新，但很适合学习传统 Web3 前端的基本结构。

你可以把它理解成下面几层：

- 页面层：`pages`
- 组件层：`components`、`containers`
- 状态层：`redux`
- 链交互层：`hooks`
- 配置层：`config`

## 4. 前端主结构

### 4.1 应用入口

你最先应该看的文件：

- `c2n-fe/src/pages/_app.tsx`
- `c2n-fe/src/Providers.tsx`

这两个文件负责：

- 注入 `Web3ReactProvider`
- 注入 Redux Store
- 加载全局样式
- 挂载 Header / Footer / WalletModal
- 处理路由切换 loading

这部分是你重写前端时的第一个起点。

### 4.2 页面入口

主要页面在：

- `c2n-fe/src/pages/index.tsx`
- `c2n-fe/src/pages/stake.tsx`
- `c2n-fe/src/pages/project.tsx`
- `c2n-fe/src/pages/dex.tsx`
- `c2n-fe/src/pages/swap.tsx`
- `c2n-fe/src/pages/liquidity.tsx`

你可以先把这些页面理解成“页面路由壳子”，真正的业务大多在 `containers` 和 `hooks`。

### 4.3 业务容器

几个值得重点看的容器：

- `c2n-fe/src/containers/StakingForm/StakingForm.tsx`
- `c2n-fe/src/containers/SwapPage/SwapPage.tsx`
- `c2n-fe/src/containers/LiquidityPage/LiquidityPage.tsx`
- `c2n-fe/src/containers/ParticipateModal/ParticipateModal.tsx`

这些容器通常负责：

- 组织页面 UI
- 调用业务 hook
- 把数据传给按钮、输入框、弹窗

### 4.4 链交互 hook

最重要的几个 hook：

- `c2n-fe/src/hooks/useWallet.ts`
- `c2n-fe/src/hooks/useStake.ts`
- `c2n-fe/src/hooks/useSwap.ts`
- `c2n-fe/src/hooks/useContract.ts`

这是你最应该学懂的部分，因为 Web3 前端真正的核心不是 UI，而是：

- 什么时候拿 provider
- 什么时候拿 signer
- 什么时候 new Contract
- 什么时候调用 view
- 什么时候发交易并等待确认

### 4.5 配置文件

重点看：

- `c2n-fe/src/config/index.js`
- `c2n-fe/src/config/valid_chains.js`

这里面放的是：

- 合约地址
- Router / Factory / Pair ABI
- 质押池地址
- 允许连接的链
- 后端 API 域名

你重写时最好把“地址、链配置、ABI、常量”继续独立放在配置层，不要散落在页面里。

## 5. 推荐你先掌握的知识点

### 5.1 React / 前端基础

至少要比较稳：

- React 函数组件
- `useState`
- `useEffect`
- 受控表单
- 条件渲染
- 列表渲染
- 组件拆分
- props 设计
- 异步请求
- loading / error / empty 三种状态

### 5.2 Web3 前端基础

最少要掌握这些概念：

- `window.ethereum`
- 钱包连接
- 切换网络
- `ethers.providers.Web3Provider`
- `signer`
- `new Contract(address, abi, signer)`
- 只读调用和交易调用的区别
- `approve`
- `transaction.wait()`

### 5.3 DEX 业务基础

为了看懂 Swap / Liquidity，建议你补这几个概念：

- `Router`
- `Factory`
- `Pair`
- `getAmountsOut`
- `addLiquidity`
- `removeLiquidity`
- `swapExactTokensForTokens`

### 5.4 IDO 业务基础

为了看懂 `project.tsx`，建议你知道：

- 注册期
- 销售期
- TGE
- 解锁 / Vesting
- 后端签名
- 前端拿签名后调用合约

## 6. 最推荐的重写顺序

不要一上来就重写 `project.tsx`。它太杂，页面逻辑、后端接口、签名、合约调用、时间状态机都混在一起，学习曲线很陡。

### 第 1 步：先搭应用壳子

先自己建一个最小结构：

- 全局 Provider
- Header
- Footer
- WalletModal
- 页面路由

目标：

- 页面能切换
- 全局样式能生效
- 钱包弹窗能挂上去

### 第 2 步：先做钱包连接

重点参考：

- `c2n-fe/src/hooks/useWallet.ts`
- `c2n-fe/src/components/elements/TransactionButton.tsx`

先实现：

- 连接钱包
- 读取地址
- 读取 chainId
- 切换网络
- 断开连接

这一步做完，你的前端才算真正“活了”。

### 第 3 步：重写 Stake 页面

重点参考：

- `c2n-fe/src/pages/stake.tsx`
- `c2n-fe/src/containers/StakingForm/StakingForm.tsx`
- `c2n-fe/src/hooks/useStake.ts`

这部分最适合练手，因为流程最清晰：

1. 获取余额
2. 获取已质押数量
3. 获取 allowance
4. `approve`
5. `deposit`
6. `withdraw`
7. 刷新 UI

如果你能自己把这个页面完整敲出来，说明你已经掌握了最核心的 Web3 前端交互流程。

### 第 4 步：重写 Swap / Liquidity

重点参考：

- `c2n-fe/src/hooks/useContract.ts`
- `c2n-fe/src/hooks/useSwap.ts`
- `c2n-fe/src/containers/SwapPage/SwapPage.tsx`
- `c2n-fe/src/containers/LiquidityPage/LiquidityPage.tsx`

你在这一步主要练的是：

- 获取交易对
- 获取报价
- token 授权给 Router
- 发起 Swap
- 添加流动性
- 移除流动性

### 第 5 步：最后再看 IDO 项目页

重点参考：

- `c2n-fe/src/pages/project.tsx`

这页是全项目最复杂的一页。因为它混了：

- 后端项目详情接口
- 注册签名接口
- 购买签名接口
- 质押状态判断
- 时间状态切换
- 提币逻辑

你如果暂时不想自己写后端，那这一页可以：

- 先只重写 UI
- 再 mock 接口
- 最后再对接真实接口

## 7. 每个核心文件你该重点看什么

### `src/pages/_app.tsx`

重点看：

- 全局 Provider 怎么挂
- Header / Footer 怎么统一包裹
- WalletModal 怎么全局挂载

你自己重写时的目标：

- 搭出应用公共骨架

### `src/hooks/useWallet.ts`

重点看：

- 如何监听 `accountsChanged`
- 如何监听 `chainChanged`
- 如何初始化 signer
- 如何根据 saleAddress 创建 saleContract
- 如何切网络

你自己重写时的目标：

- 把钱包逻辑单独收口，不要散在每个页面里

### `src/hooks/useStake.ts`

重点看：

- 如何创建 staking contract
- 如何读余额和质押数量
- 如何做 `approve`
- 如何做 `deposit` / `withdraw`

你自己重写时的目标：

- 独立写一个 `useStake` 或 `stakeService`

### `src/hooks/useSwap.ts`

重点看：

- 如何通过 `Factory` 找到 Pair
- 如何通过 `Router` 拿报价
- 如何给 Router 授权

你自己重写时的目标：

- 把 Swap 的状态和链调用拆开，不要全堆在页面里

### `src/pages/project.tsx`

重点看：

- 页面状态是怎么切的
- 后端接口在哪些地方参与了流程
- 注册、购买、提取分别调用了什么

你自己重写时的目标：

- 先理解流程，不要急着重构

## 8. 这个项目里哪些地方不要直接照抄

这个项目适合学习，但并不意味着实现方式都值得原样复制。

### 8.1 路由事件监听写法不够稳

`_app.tsx` 里直接在组件执行过程中写：

- `Router.events.on('routeChangeStart', ...)`
- `Router.events.on('routeChangeComplete', ...)`

问题：

- 组件重渲染时可能重复绑定

你自己重写时应该放进 `useEffect`，并在卸载时清理事件。

### 8.2 `listenToWallet` 的写法不推荐继续模仿

`useWallet.ts` 里把带 hook 的逻辑写成了一个普通函数再在 `_app.tsx` 里调用，这种写法不够规范。

你重写时更推荐：

- 直接写成 `useWalletListener()`
- 或把监听逻辑放进 `WalletProvider`

### 8.3 Stake 页错误网络分支实际上被绕过了

`stake.tsx` 里有：

- `true || !!chain`

这会导致错误网络的 UI 分支失效。

这类代码你要学会主动识别，不要照抄。

### 8.4 `approve` 金额和精度处理不够通用

`useStake.ts` 里授权金额写死成了固定值，而且 `18` 位精度也写死了。

问题：

- 如果 token 不是 18 位，就有风险
- 如果想做更通用的前端，这种写法不够稳

你重写时应该：

- 先读 `decimals`
- 再按真实精度处理
- 授权逻辑和显示逻辑分离

### 8.5 Swap 报价默认写死 18 位

`useSwap.ts` 里的 `getAmountsOut` 直接按 `18` 位 parse。

问题：

- 非 18 位 token 可能出错

你重写时要把 token 精度一起纳入状态。

### 8.6 Windows 环境下脚本不能直接照搬

`package.json` 里的脚本用了：

- `export NODE_ENV=... && next ...`

这更偏 Unix shell 写法。你现在是 PowerShell 环境，直接照抄不合适。

你自己重写时建议：

- 用跨平台方式设置环境变量
- 或改成更兼容的脚本写法

## 9. 如果你要自己从头写，我建议的目录结构

你不一定要完全照这个项目原样组织目录。更适合学习和重构的结构可以是：

```text
src/
  pages/
    index.tsx
    stake.tsx
    swap.tsx
    liquidity.tsx
    project.tsx
  components/
    layout/
    wallet/
    common/
  features/
    stake/
    swap/
    project/
  hooks/
    useWallet.ts
    useNetwork.ts
  lib/
    contracts.ts
    format.ts
    wallet.ts
  config/
    chains.ts
    contracts.ts
    abis.ts
  styles/
    globals.scss
```

这样做的好处：

- 页面职责更清楚
- 业务逻辑不容易散
- 后续做重构更轻松

## 10. 一份适合你的实战路线

### 第一阶段：先不碰复杂链逻辑

先自己完成：

- 页面路由
- Header / Footer
- 按钮和卡片组件
- Stake 页和 Swap 页静态 UI

目标：

- 不接链，先把页面结构写出来

### 第二阶段：接钱包和基础合约读取

再做：

- 连接钱包
- 切换网络
- 读取余额
- 读取合约只读数据

目标：

- 把最基础的钱包和读取打通

### 第三阶段：完成 Stake 的完整交易流

再做：

- approve
- stake
- withdraw
- 刷新余额和状态

目标：

- 完成第一个完整链上交互闭环

### 第四阶段：完成 DEX 的完整交易流

再做：

- quote
- swap
- add liquidity
- remove liquidity

目标：

- 理解 Router / Factory / Pair 的前端调用链

### 第五阶段：最后补 IDO 页面

最后再做：

- 项目详情
- 注册
- 购买
- 提取

目标：

- 看懂“前端 + 后端签名 + 合约”的联合流程

## 11. 7 天练习计划

### Day 1

- 看懂目录结构
- 自己新建前端壳子
- 配好全局 Provider 和页面路由

### Day 2

- 重写 Header / Footer / WalletModal
- 完成钱包连接按钮
- 显示钱包地址和链信息

### Day 3

- 重写 Stake 页静态 UI
- 接入 `useWallet`
- 读余额和质押数据

### Day 4

- 完成 Stake 的 `approve / deposit / withdraw`
- 补 loading、错误提示、成功提示

### Day 5

- 重写 Swap 页
- 接入 Router / Factory
- 做报价和 Swap

### Day 6

- 完成 Liquidity 页面
- 做添加和移除流动性

### Day 7

- 最后看 `project.tsx`
- 先只梳理流程
- 再决定要不要 mock 后端接口来自己实现

## 12. 你学到什么才算真的学会

如果你能做到下面这些，就说明你不是在“照抄”，而是真的学会了：

- 不看原项目，也能自己把前端壳子搭起来
- 能独立写出钱包连接和切网络逻辑
- 能解释 `provider / signer / contract` 三者关系
- 能自己实现 `approve -> write contract -> wait -> refresh UI`
- 能看懂 DEX 前端为什么要调 `getAmountsOut`
- 能指出这个项目里哪些实现是业务思路对，但工程写法一般

## 13. 最后给你的建议

你现在最适合的学习方式不是逐行背代码，而是：

1. 先看懂页面职责
2. 再自己搭一个新前端
3. 先把 UI 和流程写出来
4. 最后再一点点补链上交互

这样你学到的是“如何构建 Web3 前端”，不是“如何机械复刻一个项目”。

如果你愿意，下一步我可以继续帮你补两份内容里的其中一个：

- 一份“按文件逐个学习”的 checklist
- 一份“从零重写这个前端”的开发任务清单
