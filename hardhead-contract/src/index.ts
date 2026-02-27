import { ethers } from "ethers";
const ERROR = "未找到ethereum provider，请检查一下是否安装小狐狸钱包，或者还没有登陆钱包";

function getEth() {
    // @ts-ignore
    const eth = window.ethereum;
    if (!eth) {
        throw new Error(ERROR);
    }
    return eth;
}


async function requestAccess() {
    const eth = getEth();

    const result = await eth.request({ method: "eth_requestAccounts" }) as string[];

    return result && result.length > 0;
}


async function hasSigners() {
    const metamask = getEth();
    const signers = await metamask.request({ method: "eth_accounts" }) as string[];
    return signers.length > 0;
}


async function getContract() {
    if (! await hasSigners() && !await requestAccess()) {
        throw new Error(ERROR);
    }
    const provider = new ethers.BrowserProvider(getEth());
    const address = process.env.CONTRACT_ADDRESS;
    // 创建合约 需要一下三个参数
    // 1. 地址
    // 2. 方法名
    // 3. provider 一个连接到网络的中介
    const contract = new ethers.Contract(
        address,
        ["function hello() public pure returns (string memory)"],
        provider
    );

    document.body.innerHTML = await contract.hello();
}


async function main() {
    await getContract();
}

main();