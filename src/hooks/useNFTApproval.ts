import {
  TransactionStatus,
  useTransactionWrapper
} from "./useTransactionWrapper";
import { EMPTY, from, map, Observable } from "rxjs";
import { Nft } from "../contexts/graph/classes";
import { useCallback, useContext, useEffect, useState } from "react";
import { getDistinctItems } from "../utils";
import { useContractAddress } from "../contexts/StateProvider";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import UserContext from "../contexts/UserProvider";
import { useObservable } from "./useObservable";
import { TransactionStateEnum } from "../types";

export function useNFTApproval(nfts: Nft[]): {
  setApprovalForAll: (
    nfts: Nft[],
    currentAddress: string
  ) => Observable<TransactionStatus>;
  isApprovalForAll: (nft: Nft[], currentAddress: string, contractAddress: string) => Promise<[boolean, Nft[]]>;
  isApproved: boolean,
  approvalStatus: TransactionStatus,
  handleApproveAll: () => void
} {
  const transactionWrapper = useTransactionWrapper();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const contractAddress = useContractAddress();
  const currentAddress = useContext(CurrentAddressWrapper);
  const { web3Provider: provider } = useContext(UserContext);
  const [approvalStatus, setObservable] = useObservable();

  // handle approve
  const setApprovalForAll = useCallback(
    (nfts: Nft[], contractAddress: string) => {
      if (!currentAddress) return EMPTY;
      if (!nfts || nfts.length < 1) return EMPTY;
      const distinctItems = nfts.filter(
        (item, index, all) =>
          all.findIndex((nft) => nft.address === item.address) === index
      );
      if (distinctItems.length < 1) return EMPTY;
      return transactionWrapper(
        Promise.all(
          distinctItems.map((nft) => {
            const contract = nft.contract();
            return contract.setApprovalForAll(contractAddress, true);
          })
        ),
        {action: 'nft approval', label: `${distinctItems.map((t => `address: ${t.address} tokenId: ${t.tokenId}`)).join(',')}`}
      );
    },
    [transactionWrapper]
  );

  // check if approved
  const isApprovalForAll = useCallback(
    async (nft: Nft[], currentAddress: string, contractAddress: string): Promise<[boolean, Nft[]]> => {
      const result = await Promise.all(
        getDistinctItems(nft, "address").map((nft) => {
          const contract = nft.contract();
          return contract
            .isApprovedForAll(currentAddress, contractAddress)
            .then((isApproved) => {
              return [nft, isApproved, null];
            })
            .catch((e) => {
              return [nft, false, e];
            });
        })
      );
      const nonApproved = result
        .filter(([_, isApproved]) => !isApproved)
        .map(([nft]) => nft);
      return [nonApproved.length < 1, nonApproved];
    },
    []
  );

  // useeffect to check if isapproved or not
  useEffect(() => {
    if (!currentAddress) return;
    if (!contractAddress) return;
    setIsApproved(false);
    const transaction = from(
      isApprovalForAll(nfts, currentAddress, contractAddress).catch(() => {
        console.warn("batch lend issue with is approval for all");
        return null;
      })
    ).pipe(
      map((arg) => {
        if (!arg) return;
        const [status, nonApproved] = arg;
        if (status) setIsApproved(status);
        setNonApprovedNfts(nonApproved);
      })
    );

    const subscription = transaction.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [nfts, currentAddress, contractAddress]);

  useEffect(()=>{
    if(approvalStatus.status === TransactionStateEnum.SUCCESS){
      setIsApproved(true)
    }
  }, [approvalStatus])
  // handle function to approve and subscribe to result
  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    setObservable(setApprovalForAll(nonApprovedNft, contractAddress));
  }, [
    provider,
    setApprovalForAll,
    setObservable,
    nonApprovedNft,
    currentAddress
  ]);

  return { setApprovalForAll, isApprovalForAll, isApproved, approvalStatus, handleApproveAll };
}
