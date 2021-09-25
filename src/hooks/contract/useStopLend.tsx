import { useCallback } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useCreateRequest
} from "../misc/useOptimisticTransaction";
import { Lending } from "../../types/classes";

export const useStopLend = (): {
  stopLend: (lendings: Lending[]) => void;
  status: TransactionStatus;
} => {
  const { createRequest, status } = useCreateRequest();

  const sdk = useSDK();

  const stopLend = useCallback(
    (lendings: Lending[]) => {
      if (!sdk) return false;
      const arr: [string[], BigNumber[], BigNumber[]] = [
        lendings.map((lending) => lending.nftAddress),
        lendings.map((lending) => BigNumber.from(lending.tokenId)),
        lendings.map((lending) => BigNumber.from(lending.id))
      ];
      createRequest(sdk.stopLending(...arr), {
        action: "return nft",
        label: `
          addresses: ${lendings.map((lending) => lending.nftAddress)}
          tokenId: ${lendings.map((lending) => BigNumber.from(lending.tokenId))}
          lendingId: ${lendings.map((lending) => BigNumber.from(lending.id))}
        `
      });
    },
    [sdk, createRequest]
  );
  return { stopLend, status };
};
