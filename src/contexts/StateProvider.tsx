import { RENFT_ADDRESS } from "@renft/sdk";
import React, { useContext, useEffect, useState } from "react";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { AvailableForRentProvider } from "./AvailableForRent";
import { NFTMetaProvider } from "./NftMetaState";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";
import { TimestampProvider } from "./TimestampProvider";
import { NetworkName } from "../types";
import { SnackAlertProvider } from "./SnackProvider";
import UserContext, { UserProvider } from "./UserProvider";


export const StateProvider: React.FC = ({ children }) => {
  return (
    <UserProvider>
      <CurrentAddressProvider>
        <GraphProvider>
          <TransactionStateProvider>
            <NFTMetaProvider>
              <UserLendingProvider>
                <UserRentingProvider>
                  <AvailableForRentProvider>
                    <TimestampProvider>
                      <SnackAlertProvider>{children}</SnackAlertProvider>
                    </TimestampProvider>
                  </AvailableForRentProvider>
                </UserRentingProvider>
              </UserLendingProvider>
            </NFTMetaProvider>
          </TransactionStateProvider>
        </GraphProvider>
      </CurrentAddressProvider>
    </UserProvider>
  );
};

export const useContractAddress = (): string => {
  const { instance } = useContext(ReNFTContext);
  const {web3Provider} = useContext(UserContext);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const getNetwork = async () => {
      const network = await web3Provider?.getNetwork();
      const name = network?.name;
      const newAddress =
        name === NetworkName.mainnet ? RENFT_ADDRESS : instance?.address || "";
      if (newAddress) setAddress(newAddress);
    };
    getNetwork();
  }, [instance, web3Provider, address]);
  return address;
};
