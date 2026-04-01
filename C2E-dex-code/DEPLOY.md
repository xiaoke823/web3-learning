# 极简部署说明

本文档介绍了快速部署 IDO 的核心步骤，具体流程可以详见 c2n-contract 和 c2n-be 下面的 README

## 合约部署

合约部署使用 c2n-contracts/Makefile 对合约进行了快速部署，相关业务参数使用了可以快速启动的缺省值
npx hardhat node
make ido

## 后端部署

需要确保在开发环境中安装好 jdk8, maven(3.6.3+) && docker(20.10.17+) 和 docker compose
使用 c2n-be/deploy.sh 完成部署
sh deploy.sh

## 前端部署

前端使用 yarn 进行构建和启动
yarn install
yarn dev
