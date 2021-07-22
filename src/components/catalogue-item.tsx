import React, { useState, useEffect, useCallback, useContext } from "react";

import { Nft } from "../contexts/graph/classes";
import GraphContext from "../contexts/graph";
import {
  addOrRemoveUserFavorite,
  nftId,
  upvoteOrDownvote,
  getNftVote
} from "../services/firebase";
import { CalculatedUserVote, UsersVote } from "../contexts/graph/types";
import { calculateVoteByUser } from "../services/vote";
import CatalogueItemRow from "./catalogue-item-row";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { NFTMetaContext } from "../contexts/NftMetaState";
import { Checkbox } from "./common/checkbox";
import UserContext from "../contexts/UserProvider";
// @ts-ignore
import { Player } from "video-react";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
  onCheckboxChange: () => void;
  disabled?: boolean;
};
const Skeleton = () => {
  return (
    <div className="skeleton">
      <div className="skeleton-item control"></div>
      <div className="skeleton-item img"></div>
      <div className="skeleton-item meta-line"></div>
      <div className="skeleton-item meta-line"></div>
      <div className="skeleton-item meta-line"></div>
      <div className="skeleton-item btn"></div>
    </div>
  );
};
const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  isAlreadyFavourited,
  checked,
  onCheckboxChange,
  children,
  disabled
}) => {
  const { signer } = useContext(UserContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const { userData, calculatedUsersVote } = useContext(GraphContext);
  const [inFavorites, setInFavorites] = useState<boolean>();
  const [amount, setAmount] = useState<string>("0");
  const [currentVote, setCurrentVote] =
    useState<{
      downvote?: number;
      upvote?: number;
    }>();
  const [imageIsReady, setImageIsReady] = useState<boolean>(false);
  const [metas] = useContext(NFTMetaContext);
  const id = nftId(nft.address, nft.tokenId);
  const meta = metas[id];
  const noWallet = !signer;

  const addOrRemoveFavorite = useCallback(() => {
    addOrRemoveUserFavorite(currentAddress, nft.address, nft.tokenId)
      .then((resp: boolean) => {
        setInFavorites(resp);
      })
      .catch(() => {
        console.warn("could not change userFavorite");
      });
  }, [nft, currentAddress]);

  const handleVote = useCallback(
    (vote: number) => {
      upvoteOrDownvote(currentAddress, nft.address, nft.tokenId, vote)
        .then(() => {
          getNftVote(nft.address, nft.tokenId)
            .then((resp: UsersVote) => {
              const id = nftId(nft.address, nft.tokenId);
              const voteData: CalculatedUserVote = calculateVoteByUser(
                resp,
                id
              );
              const currentAddressVote = voteData?.[id] ?? {};
              setCurrentVote(currentAddressVote);
            })
            .catch(() => {
              console.warn("could not getNftVote");
            });
        })
        .catch(() => {
          console.warn("could not handle vote");
        });
    },
    [nft, currentAddress]
  );

  const handleUpVote = useCallback(() => handleVote(1), [handleVote]);
  const handleDownVote = useCallback(() => handleVote(-1), [handleVote]);

  useEffect(() => {
    nft
      .loadAmount(currentAddress)
      .then((a) => {
        setAmount(a);
      })
      .catch(() => console.warn("could not load amount"));
  }, [checked, nft, meta?.image, currentAddress]);

  useEffect(() => {
    if (meta && !meta.loading) {
      setImageIsReady(true);
    }
  }, [meta]);

  const addedToFavorites =
    inFavorites !== undefined ? inFavorites : userData?.favorites?.[id];
  const nftVote =
    currentVote == undefined ? calculatedUsersVote[id] : currentVote;
  const { name, image, description } = meta || {};
  // This is a stupid check, it should check the mimetype of the source
  const isVideo =
    image?.endsWith("mp4") ||
    image?.endsWith("mkv") ||
    image?.endsWith("webm") ||
    image?.endsWith("mov") ||
    image?.endsWith("avi") ||
    image?.endsWith("flv");
  const display = () => {
    if (isVideo) return <Player playsInline autoPlay src={image} muted />;
    return <img alt={description} src={image} />;
  };
  return (
    <div
      className={`nft ${checked ? "checked" : ""} ${
        nft.isERC721 ? "nft__erc721" : "nft__erc1155"
      }`}
      key={nft.tokenId}
      data-item-id={nft.tokenId}
    >
      {!imageIsReady && <Skeleton></Skeleton>}
      {imageIsReady && (
        <>
          <div className="nft__overlay">
            {/* {!isAlreadyFavourited && (
              <div
                className={`nft__favourites ${
                  addedToFavorites ? "nft__favourites-on" : ""
                }`}
                onClick={addOrRemoveFavorite}
              />
            )} */}
            {/* <div className="nft__vote nft__vote-plus" onClick={handleUpVote}>
              <span className="icon-plus" />+{nftVote?.upvote || "?"}
            </div>
            <div className="nft__vote nft__vote-minus" onClick={handleDownVote}>
              <span className="icon-minus" />-{nftVote?.downvote || "?"}
            </div> */}
            <div className="spacer" />
            <Checkbox
              checked={!!checked}
              handleClick={onCheckboxChange}
              disabled={disabled || noWallet}
            ></Checkbox>
          </div>
          <div className="nft__image">
            {image ? display() : <div className="no-img">NO IMG</div>}
          </div>
          <div className="nft__meta">
            {name && <div className="nft__name">{name}</div>}
            <CatalogueItemRow
              text="Address"
              value={
                <a
                  href={`https://etherscan.io/address/${nft.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {nft.address}
                </a>
              }
            />
            <CatalogueItemRow text="Token id" value={nft.tokenId} />
            <CatalogueItemRow
              text="Standard"
              value={nft.isERC721 ? "721" : "1155"}
            />
            <CatalogueItemRow
              text="Amount"
              value={nft.isERC721 ? "1" : amount}
            />
          </div>
          {children}
        </>
      )}
    </div>
  );
};

export default CatalogueItem;
