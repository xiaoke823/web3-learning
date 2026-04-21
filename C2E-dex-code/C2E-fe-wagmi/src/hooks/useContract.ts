import { useAppSelector } from "@src/redux/hooks";
import { usePublicClient, useWalletClient } from "wagmi";
import AirdropAbi from '@src/util/abi/Airdrop.json'
import { airdropContract, factoryAbi, routerAbi, swapAddresses } from "@src/config";
import { useMemo } from "react";
import { createViemContract } from "@src/lib/viem";

export const useAirdropContract = () => {
  const chain = useAppSelector(state => state.wallet.chain);
  const publicClient = usePublicClient({ chainId: chain?.chainId });
  const { data: walletClient } = useWalletClient();

  const airdropAddress = airdropContract.find(item => item.chainId == chain?.chainId)?.address || airdropContract[0].address;
  return useMemo(() => {
    if (!airdropAddress || !publicClient) return null;
    return createViemContract({
      address: airdropAddress,
      abi: AirdropAbi.abi,
      publicClient,
      walletClient,
    });
  }, [airdropAddress, publicClient, walletClient]);
}

export const useRouterContract = () => {
  const chain = useAppSelector(state => state.wallet.chain);
  const publicClient = usePublicClient({ chainId: chain?.chainId });
  const { data: walletClient } = useWalletClient();

  const routerAddress = swapAddresses.find(item => item.chainId === chain?.chainId)?.routerAddress;
  return useMemo(() => {
    if (!routerAddress || !publicClient) return null;
    return createViemContract({
      address: routerAddress,
      abi: routerAbi,
      publicClient,
      walletClient,
    });
  }, [routerAddress, publicClient, walletClient]);
}

export const useFactoryContract = () => {
  const chain = useAppSelector(state => state.wallet.chain);
  const publicClient = usePublicClient({ chainId: chain?.chainId });
  const { data: walletClient } = useWalletClient();

  const factoryAddress = swapAddresses.find(item => item.chainId === chain?.chainId)?.factoryAddress;

  return useMemo(() => {
    if (!factoryAddress || !publicClient) return null;
    return createViemContract({
      address: factoryAddress,
      abi: factoryAbi,
      publicClient,
      walletClient,
    });
  }, [factoryAddress, publicClient, walletClient]);
}
