import { useCallback, useEffect } from "react";
import request from "graphql-request";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { timer, from, switchMap, map } from "rxjs";
import produce from "immer";
import shallow from "zustand/shallow";
import create from "zustand";
import { devtools } from "renft-front/hooks/devtools";

import { PaymentToken } from "@renft/sdk";

interface TOKEN_PRICE {
  tokenPerUSD: Record<PaymentToken, number>;
  setWETH: (price: number) => void;
}

const useExchangePriceStore = create<TOKEN_PRICE>(
  devtools((set) => ({
    tokenPerUSD: {
      [PaymentToken.WETH]: 1,
      [PaymentToken.DAI]: 1,
      [PaymentToken.USDT]: 1,
      [PaymentToken.USDC]: 1,
      [PaymentToken.TUSD]: 1,
      [PaymentToken.SENTINEL]: 0,
      [PaymentToken.RENT]: 0,
    },
    setWETH: (price: number) =>
      set(
        produce((state) => {
          state.tokenPerUSD[PaymentToken.WETH] = price;
        })
      ),
  }))
);

//TODO:eniko can be replaced by ethers, they implemented ETH price
const getPrice = (): Promise<number> =>
  request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    `{
          bundles(first: 1) {
              id
              ethPriceUSD
          }
        }`
  )
    .then((data) => {
      return data.bundles[0].ethPriceUSD;
    })
    .catch((e) => {
      //TODO:eniko sentry log
      return 0;
    });

export const useExchangePrice = () => {
  const setWETH = useExchangePriceStore((state) => state.setWETH);
  const tokenPerUSD = useExchangePriceStore(
    useCallback((state) => state.tokenPerUSD, []),
    shallow
  );

  useEffect(() => {
    const subscription = timer(0, 60 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => from(getPrice())),
        map(setWETH)
      )
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [setWETH]);

  return tokenPerUSD;
};
