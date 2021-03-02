import React, { useContext, useCallback } from "react";

import { BigNumber } from "ethers";

import {
  MyERC721Context,
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import { ERC1155 } from "../../../hardhat/typechain/ERC1155";
import { ERC721 } from "../../../hardhat/typechain/ERC721";

const BigNumZero = BigNumber.from("0");

export const useFetchNftDev = (): (() => Promise<{
  [x: string]: {
    contract: ERC721 | ERC1155;
    isApprovedForAll: boolean;
    isERC721: boolean;
    tokenIds: any;
  };
}>) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const renft = useContext(RentNftContext);

  // * mock erc721 contract
  const myERC721 = useContext(MyERC721Context);
  // ! only used in dev environment - so don't worry about this too much
  const fetchNftDev = useCallback(async () => {
    if (!myERC721.instance || !renft.instance) return {};

    const toFetch: Promise<Response>[] = [];
    const tokenIds: string[] = [];

    // * only fetching ERC721s in dev right now
    // todo: add ERC1155s
    const contract = myERC721.instance;

    const numNfts = await contract
      .balanceOf(currentAddress)
      .catch(() => BigNumZero);

    if (numNfts.eq(BigNumZero)) return {};

    for (let i = 0; i < numNfts.toNumber(); i++) {
      // get the tokenId, and then fetch the metadata uri, then push this to toFetch
      const tokenId = await contract
        .tokenOfOwnerByIndex(currentAddress, i)
        .catch(() => -1);
      if (tokenId === -1) continue;

      const metaURI = await contract.tokenURI(tokenId).catch(() => "");
      if (!metaURI) continue;

      tokenIds.push(tokenId.toString());
      toFetch.push(
        fetch(metaURI, {
          headers: [["Content-Type", "text/plain"]],
        })
          .then(async (dat) => await dat.json())
          .catch(() => ({}))
      );
    }
    if (toFetch.length === 0) return {};

    const res = await Promise.all(toFetch);
    const tokenIdsObj = {};
    for (let i = 0; i < res.length; i++) {
      Object.assign(tokenIdsObj, { [tokenIds[i]]: res[i] });
    }

    const isApprovedForAll = await contract
      .isApprovedForAll(currentAddress, renft.instance?.address ?? "")
      .catch(() => false);

    return {
      [contract.address]: {
        contract,
        isApprovedForAll,
        isERC721: true,
        tokenIds: tokenIdsObj,
      },
    };
  }, [renft.instance, currentAddress, myERC721.instance]);

  return fetchNftDev;
};

export default useFetchNftDev;
