# React-Wagmi Web3 项目学习指南

## 项目概述

这是一个基于 **Vite + React + TypeScript** 构建的 Web3 去中心化应用（DApp）示例项目，集成了 **Reown AppKit**（原 WalletConnect v3）和 **Wagmi**，用于演示如何：

- 连接钱包
- 签名消息
- 发送交易
- 与智能合约交互

---

## 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.1 | 前端 UI 框架 |
| TypeScript | 5.5.3 | 类型安全的 JavaScript |
| Vite | 7.2.7 | 构建工具和开发服务器 |

### Web3 相关

| 技术 | 版本 | 用途 |
|------|------|------|
| @reown/appkit | 1.8.19 | Reown AppKit 核心（钱包连接模态框） |
| @reown/appkit-adapter-wagmi | 1.8.19 | Wagmi 适配器 |
| wagmi | 2.18.0 | React Hooks for Ethereum |
| viem | 2.47.0 | TypeScript 以太坊接口 |
| @tanstack/react-query | 5.90.3 | 数据获取和状态管理 |

---

## 目录结构

```
react-wagmi/
├── public/                          # 静态资源目录
│   ├── favicon.ico                  # 网站图标
│   └── reown.svg                    # Reown Logo
├── src/                             # 源代码目录
│   ├── assets/                      # 静态资源
│   │   └── react.svg                # React Logo
│   ├── components/                  # React 组件
│   │   ├── ActionButtonList.tsx     # 操作按钮组件
│   │   ├── InfoList.tsx             # 信息展示组件
│   │   └── SmartContractActionButtonList.tsx  # 智能合约交互组件
│   ├── config/                      # 配置目录
│   │   └── index.tsx                # AppKit 和 Wagmi 配置
│   ├── App.tsx                      # 主应用组件
│   ├── App.css                      # 应用样式
│   ├── main.tsx                     # 应用入口
│   └── vite-env.d.ts                # Vite 类型声明
├── .env.test                        # 环境变量示例
├── eslint.config.js                 # ESLint 配置
├── index.html                       # HTML 入口
├── package.json                     # 项目依赖配置
├── tsconfig.json                    # TypeScript 配置
└── vite.config.ts                   # Vite 配置
```

---

## 核心文件详解

### 1. 入口文件 - [main.tsx](src/main.tsx)

React 应用的入口点，负责：
- 使用 `createRoot` 渲染 App 组件
- 启用 `StrictMode` 进行严格模式检查

### 2. 主应用组件 - [App.tsx](src/App.tsx)

核心职责：
- 初始化 Reown AppKit 模态框
- 配置 WagmiProvider 和 QueryClientProvider
- 管理状态：transactionHash、signedMsg、balance
- 整合三个核心组件

### 3. 配置文件 - [config/index.tsx](src/config/index.tsx)

配置内容包括：
- **projectId**: Reown 项目 ID
- **metadata**: 应用元数据（名称、描述、图标）
- **networks**: 支持的网络（mainnet、arbitrum、sepolia）
- **wagmiAdapter**: Wagmi 适配器配置

---

## 核心组件详解

### 1. ActionButtonList 组件

**路径**: [src/components/ActionButtonList.tsx](src/components/ActionButtonList.tsx)

**功能**: 提供钱包操作的按钮列表

**使用的 Wagmi Hooks**:

| Hook | 用途 |
|------|------|
| `useDisconnect` | 断开钱包连接 |
| `useSendTransaction` | 发送交易 |
| `useSignMessage` | 签名消息 |
| `useEstimateGas` | 估算 Gas |
| `useBalance` | 查询余额 |

**使用的 AppKit Hooks**:

| Hook | 用途 |
|------|------|
| `useAppKit` | 打开模态框 |
| `useAppKitNetwork` | 切换网络 |
| `useAppKitAccount` | 获取账户信息 |

**提供的操作**:
- **Open** - 打开钱包模态框
- **Disconnect** - 断开连接
- **Switch** - 切换网络（切换到 Arbitrum）
- **Sign msg** - 签名消息
- **Send tx** - 发送测试交易
- **Get Balance** - 获取账户余额

---

### 2. InfoList 组件

**路径**: [src/components/InfoList.tsx](src/components/InfoList.tsx)

**功能**: 展示钱包和应用状态信息

**使用的 Hooks**:

| Hook | 用途 |
|------|------|
| `useAppKitTheme` | 获取主题信息 |
| `useAppKitState` | 获取 AppKit 状态 |
| `useAppKitAccount` | 获取账户信息 |
| `useAppKitEvents` | 获取事件信息 |
| `useWalletInfo` | 获取钱包信息 |
| `useWaitForTransactionReceipt` | 等待交易确认 |

---

### 3. SmartContractActionButtonList 组件

**路径**: [src/components/SmartContractActionButtonList.tsx](src/components/SmartContractActionButtonList.tsx)

**功能**: 智能合约交互操作

**使用的 Hooks**:

| Hook | 用途 |
|------|------|
| `useReadContract` | 读取合约数据 |
| `useWriteContract` | 写入合约数据 |

**测试合约** (部署在 Sepolia 测试网):
- 地址: `0xEe6D291CC60d7CeD6627fA4cd8506912245c8cA4`
- 合约类型: Simple Storage（存储合约）
- ABI 函数:
  - `retrieve()` - 读取存储值
  - `store(uint256)` - 写入值

---

## 常用 Wagmi Hooks 速查

### 连接相关

```typescript
import { useDisconnect } from 'wagmi'
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

// 断开连接
const { disconnect } = useDisconnect()

// 打开模态框
const { open } = useAppKit()

// 获取账户信息
const { address, isConnected } = useAppKitAccount()

// 切换网络
const { switchNetwork } = useAppKitNetwork()
```

### 交易相关

```typescript
import { useSendTransaction, useEstimateGas, useWaitForTransactionReceipt } from 'wagmi'

// 发送交易
const { sendTransaction, data: hash } = useSendTransaction()

// 估算 Gas
const { data: gas } = useEstimateGas({ to: address, value: parseEther('0.001') })

// 等待交易确认
const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
```

### 签名相关

```typescript
import { useSignMessage } from 'wagmi'

// 签名消息
const { signMessage, data: signature } = useSignMessage()
```

### 合约交互

```typescript
import { useReadContract, useWriteContract } from 'wagmi'

// 读取合约
const { data } = useReadContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'retrieve',
})

// 写入合约
const { writeContract } = useWriteContract()
writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'store',
  args: [123n],
})
```

---

## 快速开始

### 1. 获取 Project ID

访问 [Reown Dashboard](https://dashboard.reown.com) 创建项目获取 Project ID

### 2. 配置环境变量

```bash
# 复制环境变量文件
cp .env.test .env

# 编辑 .env 文件，填入你的 Project ID
VITE_PROJECT_ID=your_project_id_here
```

### 3. 安装依赖并运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

---

## 学习路径建议

### 第一阶段：理解基础概念
1. 阅读 [config/index.tsx](src/config/index.tsx) 理解 AppKit 配置
2. 理解 WagmiProvider 和 QueryClientProvider 的作用
3. 了解支持的区块链网络

### 第二阶段：钱包连接
1. 学习 [ActionButtonList.tsx](src/components/ActionButtonList.tsx) 中的连接逻辑
2. 尝试不同的钱包连接方式
3. 理解账户状态管理

### 第三阶段：交易与签名
1. 学习发送交易的完整流程
2. 理解 Gas 估算
3. 实现消息签名功能

### 第四阶段：合约交互
1. 学习 [SmartContractActionButtonList.tsx](src/components/SmartContractActionButtonList.tsx)
2. 理解 ABI 的作用
3. 尝试与其他合约交互

---

## 参考资源

- [Wagmi 官方文档](https://wagmi.sh/)
- [Reown AppKit 文档](https://docs.reown.com/appkit)
- [Viem 文档](https://viem.sh/)
- [Vite 官方文档](https://vitejs.dev/)
