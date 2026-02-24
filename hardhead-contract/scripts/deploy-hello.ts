import "@nomicfoundation/hardhat-ethers"
import { ethers } from "hardhat";
async function foo() {
    const HelloWorld = await ethers.getContractFactory("HelloWorld")
    const hello = await HelloWorld.deploy()
    await hello.waitForDeployment();
    return hello;
}

async function deploy() {
    const hello = foo()
    return hello;
}

async function sayHello(hello:any) {
    console.log("Say hello:", await hello.hello())    
}

deploy().then(sayHello)