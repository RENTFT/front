import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { request } from "graphql-request";

import { ReNFTContext, SignerContext } from "../../hardhat/SymfoniContext";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../consts";
import { ASYNC_THROWS, timeItAsync } from "../../utils";
import createCancellablePromise from "../create-cancellable-promise";
import {
  queryAllRenft,
  queryUserLendingRenft,
  queryUserRentingRenft,
  queryAllLendingRenft,
} from "./queries";
import {
  getUserDataOrCrateNew,
  getAllUsersVote,
} from "../../services/firebase";
import { calculateVoteByUsers } from "../../services/vote";
import {
  NftRaw,
  UserData,
  CalculatedUserVote,
  UsersVote,
  LendingRaw,
} from "./types";
import { Nft, Lending, Renting } from "./classes";
import { parseLending, parseRenting } from "./utils";
import useFetchNftDev from "./hooks/useFetchNftDev";
import { IS_PROD } from "../../consts";
import { CurrentAddressContextWrapper } from "../CurrentAddressContextWrapper";
import {
  FetchType,
  fetchUserProd1155,
  fetchUserProd721,
} from "../../services/graph";

/**
 * Useful links
 * https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph
 * https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph
 * https://github.com/0xsequence/token-directory
 */

type LendingId = string;
type RentingId = LendingId;

type GraphContextType = {
  userData: UserData;
  usersVote: UsersVote;
  calculatedUsersVote: CalculatedUserVote;
  getAllAvailableToLend(): Promise<Nft[]>;
  getUserLending(): Promise<Lending[]>;
  getAllAvailableToRent(): Promise<Lending[]>;
  getUserRenting(): Promise<Renting[]>;
  getUserData(): Promise<UserData>;
  updateGlobalUserData(): Promise<void>;
};

const defaultUserData = {
  favorites: {},
};

const DefaultGraphContext: GraphContextType = {
  userData: defaultUserData,
  usersVote: {},
  calculatedUsersVote: {},
  getAllAvailableToLend: () => Promise.resolve([]),
  getUserLending: () => Promise.resolve([]),
  getAllAvailableToRent: () => Promise.resolve([]),
  getUserRenting: () => Promise.resolve([]),
  getUserData: () => Promise.resolve(defaultUserData),
  updateGlobalUserData: ASYNC_THROWS,
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  const { instance: renft } = useContext(ReNFTContext);
  const [_usersLending, _setUsersLending] = useState<LendingId[]>([]);
  const [_usersRenting, _setUsersRenting] = useState<RentingId[]>([]);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [calculatedUsersVote, setCalculatedUsersVote] =
    useState<CalculatedUserVote>({});
  const [usersVote, setUsersVote] = useState<UsersVote>({});

  /**
   * Only for dev purposes
   */
  const fetchNftDev = useFetchNftDev(signer);

<<<<<<< HEAD
  /**
   * Pings the eip721 and eip1155 subgraphs in prod, to determine what
   * NFTs you own
   */
  const fetchUserProd = useCallback(
    async (fetchType: FetchType) => {
      if(!currentAddress) return []
      let query = "";
      let subgraphURI = "";


      switch (fetchType) {
        case FetchType.ERC721:
          query = queryMyERC721s(currentAddress);

          if (!process.env.REACT_APP_EIP721_API) {
            throw new Error("EIP721_API is not defined");
          }
          subgraphURI = process.env.REACT_APP_EIP721_API;
          break;
        case FetchType.ERC1155:
          query = queryMyERC1155s(currentAddress);
          if (!process.env.REACT_APP_EIP1155_API) {
            throw new Error("EIP1155_API is not defined");
          }
          subgraphURI = process.env.REACT_APP_EIP1155_API;
          break;
      }

      const response: ERC721s | ERC1155s = await timeItAsync(
        `Pulled My ${FetchType[fetchType]} NFTs`,
        async () => await request(subgraphURI, query)
      );

      let tokens: NftToken[] = [];
      switch (fetchType) {
        case FetchType.ERC721:
          tokens = (response as ERC721s).tokens.map((token) => {
            // ! in the case of ERC721 the raw tokenId is in fact `${nftAddress}_${tokenId}`
            const [address, tokenId] = token.id.split("_");
            return {
              address,
              tokenURI: token.tokenURI,
              tokenId,
              isERC721: true,
            };
          });
          break;
        case FetchType.ERC1155: {
          tokens =
            (response as ERC1155s).account?.balances?.map(({ token }) => ({
              address: token.registry.contractAddress,
              tokenURI: token.tokenURI,
              tokenId: token.tokenId,
              isERC721: false,
            })) || [];
          break;
        }
      }

      // TODO: compute hash of the fetch, and everything, to avoid resetting the state, if
      // TODO: nothing has changed
      return tokens;
    },
    [currentAddress]
  );

  const fetchUsersNfts = async (): Promise<Nft[]> => {
=======
  const fetchUsersNfts = useCallback(async (): Promise<Nft[] | undefined> => {
    if (!signer) return;
    if (!currentAddress) return;
>>>>>>> 8b6eb08 (optimize render)
    let _usersNfts: Nft[] = [];
    if (!signer) return _usersNfts;

    // // ! comment this out to test prod NFT rendering in dev env
    // if (process.env.REACT_APP_ENVIRONMENT !== "development") {
    const [usersNfts721, usersNfts1155] = await Promise.all([
      fetchUserProd721(currentAddress, FetchType.ERC721),
      fetchUserProd1155(currentAddress, FetchType.ERC1155),
    ]);
    // ! lentAmount = "0"
    _usersNfts = usersNfts721.concat(usersNfts1155).map((nft) => {
      return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, signer, {
        meta: nft.meta,
        tokenURI: nft.tokenURI,
      });
    });
    // }

    let _nfts: Nft[] = _usersNfts;
    if (!IS_PROD) {
      const devNfts = await fetchNftDev();
      _nfts = devNfts.concat(_nfts);
    }

    return _nfts;
  }, [currentAddress, fetchNftDev, signer]);

  // TODO: these should be used instead of fetching all!
  const fetchUserLending = async (): Promise<string[]> => {
    if (!currentAddress) return [];

    const query = queryUserLendingRenft(currentAddress);

    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }

    const subgraphURI = process.env.REACT_APP_RENFT_API;
    const response: {
      user?: { lending?: { tokenId: LendingId; nftAddress: string }[] };
    } = await timeItAsync(
      "Pulled My Renft Lending Nfts",
      async () => await request(subgraphURI, query)
    );

    return (
      response.user?.lending?.map(
        ({ tokenId, nftAddress }) =>
          `${nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${tokenId}`
      ) ?? []
    );
  };

  // TODO: these should be used instead of fetching all!
  const fetchUserRenting = async (): Promise<string[]> => {
    if (!currentAddress) return [];

    const query = queryUserRentingRenft(currentAddress);
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    const subgraphURI = process.env.REACT_APP_RENFT_API;
    const response: {
      user?: { renting?: { id: RentingId; lending: LendingRaw }[] };
    } = await timeItAsync(
      "Pulled My Renft Renting Nfts",
      async () => await request(subgraphURI, query)
    );

    return (
      response.user?.renting?.map(
        ({ lending }) =>
          `${lending.nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${lending.id}`
      ) ?? []
    );
  };

  /**
   * Sets the renftsLending and renftsRenting state. These are mappings from
   * lending id, renting id respectively to Lending, Renting instances,
   * respectively. These are all the NFTs on reNFT platform
   */
  type ReturnReNftAll = {
    lending: {
      [key: string]: Lending;
    };
    renting: {
      [key: string]: Renting;
    };
  };

  const fetchRenftsAll = async (): Promise<ReturnReNftAll | undefined> => {
    if (!signer) return;
    const query = queryAllRenft();

    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    const subgraphURI = process.env.REACT_APP_RENFT_API;

    const response: NftRaw = await timeItAsync(
      "Pulled All Renft Nfts",
      async () => await request(subgraphURI, query)
    );

    const _allRenftsLending: { [key: string]: Lending } = {};
    const _allRenftsRenting: { [key: string]: Renting } = {};

    response?.nfts.forEach(({ id, lending, renting }) => {
      const [address, tokenId] = id.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      lending?.forEach((l) => {
        _allRenftsLending[id] = new Lending(l, signer);
      });
      renting?.forEach((r) => {
        const iLending = parseLending(r.lending);
        _allRenftsRenting[id] = new Renting(
          address,
          tokenId,
          iLending,
          r,
          signer
        );
      });
    });

    return { lending: _allRenftsLending, renting: _allRenftsRenting };
  };

  // PUBLIC API

  const getAllAvailableToLend = async (): Promise<Nft[]> => {
    const allNfts = await fetchUsersNfts();
    return allNfts;
  };

  // ALL AVAILABLE TO RENT (filter out the ones that I am lending)
  const getAlllending = useCallback(async (): Promise<
    Lending[] | undefined
  > => {
    if (!signer) return;
    if (!currentAddress) return;
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    const _currentAddress = currentAddress ? currentAddress : "";
    const subgraphURI = process.env.REACT_APP_RENFT_API;
    const response: { data: { lendings: LendingRaw[] } } = await timeItAsync(
      "Pulled All ReNFT Lendings",
      async () => await request(subgraphURI, queryAllLendingRenft)
    );

    const lendingsReNFT = [];

    for (const lending of Object.values(response?.lendings)) {
      // filters out the nfts that you have lent
      if (lending.lenderAddress.toLowerCase() === _currentAddress.toLowerCase())
        continue;
      if (lending.renting) continue;

      lendingsReNFT.push(new Lending(lending, signer));
    }
    return lendingsReNFT;
  }, [signer, currentAddress]);

  // TODO: inefficient to be fecthingRenftsAll in both user lending and user renting?

  // LENDING
  const getUserLending = useCallback(async (): Promise<Lending[] | undefined> => {
    if (!signer) return;
    if(!currentAddress) return
    if (!process.env.RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    const subgraphURI = process.env.RENFT_API;
    const response: { users: { lending: LendingRaw[] }[] } = await timeItAsync(
      "Pulled Users ReNFT Lendings",
      async () =>
        await request(subgraphURI, queryUserLendingRenft(currentAddress))
    );

<<<<<<< HEAD
    if (!response?.users[0]) return [];
=======
    if (!response?.users[0]) return;
>>>>>>> 8b6eb08 (optimize render)

    const lendings = Object.values(response.users[0].lending).map(
      (lending) => new Lending(lending, signer)
    );

    return lendings;
  }, [signer, currentAddress]);

  // RENTING
  const getUserRenting = async (): Promise<Renting[]> => {
    const renftAll = await fetchRenftsAll();
    if (renftAll) {
      return Object.values(renftAll.renting) || [];
    }
<<<<<<< HEAD
    return [];
=======
>>>>>>> 8b6eb08 (optimize render)
  };

  const getUserData = useCallback(async (): Promise<UserData> => {
    if (currentAddress) {
      const userData = await getUserDataOrCrateNew(currentAddress);
      return userData;
    }
<<<<<<< HEAD
    return {};
=======
>>>>>>> 8b6eb08 (optimize render)
  }, [currentAddress]);

  const updateGlobalUserData = useCallback(() => {
    return getUserData()
      .then((userData) => {
        if (userData) setUserData(userData);
      })
      .catch(() => {
        console.warn("could not update global user data");
      });
  }, [getUserData]);

  useEffect(() => {
    if (currentAddress) {
      const getUserDataRequest = createCancellablePromise(
        Promise.all([getAllUsersVote(), getUserData()])
      );

      getUserDataRequest.promise
        .then(([usersVote, userData]: [UsersVote, UserData | undefined]) => {
          if (usersVote && Object.keys(usersVote).length !== 0) {
            const calculatedUsersVote: CalculatedUserVote =
              calculateVoteByUsers(usersVote);

            // TODO: poor name
            setCalculatedUsersVote(calculatedUsersVote);
            setUsersVote(usersVote);
          }
          if (userData) {
            setUserData(userData);
          }
        })
        .catch(() => {
          console.warn("could not fulfill userDataRequest");
        });
      return getUserDataRequest.cancel;
    }
  }, [currentAddress, getUserData]);

  return (
    <GraphContext.Provider
      value={{
        userData,
        usersVote,
        calculatedUsersVote,
        getAllAvailableToLend,
        getUserLending,
        getAllAvailableToRent,
        getUserRenting,
        getUserData,
        updateGlobalUserData,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
