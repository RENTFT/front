import request from "graphql-request";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { CurrentAddressWrapper } from "./CurrentAddressWrapper";
import { Lending, Nft } from "./graph/classes";
import { queryAllLendingRenft } from "./graph/queries";
import { timeItAsync } from "../utils";
import { diffJson } from "diff";
import UserContext from "./UserProvider";
import { usePrevious } from "../hooks/usePrevious";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { EMPTY, from, map, switchMap, timer } from "rxjs";
import { LendingRaw } from "./graph/types";

export const AvailableForRentContext = createContext<{
  isLoading: boolean;
  allAvailableToRent: Nft[];
}>({ isLoading: true, allAvailableToRent: [] });

export const AvailableForRentProvider: React.FC = ({ children }) => {
  const { signer, network } = useContext(UserContext);

  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(true);
  const currentAddress = useContext(CurrentAddressWrapper);
  const previousAddress = usePrevious(currentAddress);

  const fetchRentings = useCallback(() => {
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    if (network !== process.env.REACT_APP_NETWORK_SUPPORTED) {
      if (nfts && nfts.length > 0) setNfts([]);
      if (isLoading) setLoading(false);
      return EMPTY;
    }

    setLoading(true);

    const subgraphURI = process.env.REACT_APP_RENFT_API;
    const fetchRequest = from<Promise<{ lendings: LendingRaw[] }>>(
      timeItAsync(
        "Pulled All ReNFT Lendings",
        async () =>
          await request(subgraphURI, queryAllLendingRenft).catch(() => {
            console.warn("could not pull all ReNFT lendings");
            return {};
          })
      )
    ).pipe(
      map((response) => Object.values(response?.lendings || [])),
      map((lendings) => {
        const address = currentAddress.toLowerCase();
        return (
          lendings
            .filter((v) => !v.renting)
            .filter((v) => v != null)
            // ! not equal. if lender address === address, then that means we have lent the item, and now want to rent our own item
            // ! therefore, this check is !==
            .filter((l) => {
              // empty address show all renting
              if (!currentAddress) return true;

              const userNotLender = l.lenderAddress.toLowerCase() !== address;
              const userNotRenter =
                (l.renting?.renterAddress ?? "o_0").toLowerCase() !== address;
              return userNotLender && userNotRenter;
            })
            .map((lending) => {
              return new Lending(lending, signer);
            })
        );
      }),
      map((lendingsReNFT) => {
        const normalizedLendings = nfts.map((l) => l.toJSON());
        const normalizedLendingNew = lendingsReNFT.map((l) => l.toJSON());

        const difference = diffJson(normalizedLendings, normalizedLendingNew, {
          ignoreWhitespace: true
        });
        //const difference = true;
        // we need to update the signer if currentAddress is non-null
        if (currentAddress !== previousAddress) {
          setNfts(lendingsReNFT);
        } else if (
          difference &&
          difference[1] &&
          (difference[1].added || difference[1].removed)
        ) {
          setNfts(lendingsReNFT);
        }
        setLoading(false);
      })
    );
    return fetchRequest;
  }, [currentAddress, nfts, signer, previousAddress, network]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchRentings))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchRentings, currentAddress]);

  return (
    <AvailableForRentContext.Provider
      value={{
        allAvailableToRent: nfts,
        isLoading
      }}
    >
      {children}
    </AvailableForRentContext.Provider>
  );
};
