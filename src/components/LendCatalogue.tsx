import React, { useState, useCallback, useContext } from "react";
import { Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import LendModal from "./LendModal";
import { Nft, Lending } from "../types";
import GraphContext from "../contexts/Graph";
import ContractsContext from "../contexts/Contracts";

type LendButtonProps = {
  handleLend: (nft: Nft) => void;
  nft: Nft;
};

type StopLendButtonProps = {
  handleStopLend: (nft: Lending) => void;
  lending: Lending;
};

// todo: maybe worth supplying both: all and the ones that I lend at the same time
type LendCatalogueProps = {
  nfts: Nft[];
  iLend: boolean;
};

const LendButton: React.FC<LendButtonProps> = ({ handleLend, nft }) => {
  const handleClick = useCallback(() => {
    handleLend(nft);
  }, [handleLend, nft]);

  return (
    <div className="Product__details">
      <span className="Product__buy" onClick={handleClick}>
        Lend now
      </span>
    </div>
  );
};

const StopLendButton: React.FC<StopLendButtonProps> = ({
  lending,
  handleStopLend,
}) => {
  const _handleStopLend = useCallback(async () => {
    await handleStopLend(lending);
  }, [lending, handleStopLend]);

  return (
    <div className="Product__details">
      <span className="Product__buy" onClick={_handleStopLend}>
        Stop Lending
      </span>
    </div>
  );
};

type CatalogueItemProps = {
  nftId: string;
  nft: Nft | Lending;
  handleLend: (nft: Nft) => void;
  handleStopLend: (lending: Lending) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nftId,
  nft,
  handleLend,
  handleStopLend,
}) => {
  // todo: not fully correct but sufficient
  const isLending = (nft: Nft | Lending): nft is Lending => {
    return (nft as Lending).dailyRentPrice !== undefined;
  };

  return (
    <div className="Catalogue__item" key={nftId}>
      <div
        className="Product"
        data-item-id={nftId}
        data-item-image={nft.imageUrl}
      >
        {/* TODO: the skeleton animation here does not work */}
        <div className="Product__image">
          <a href={nft.imageUrl}>
            {nft.imageUrl ? (
              <img alt="nft" src={nft.imageUrl} />
            ) : (
              <Skeleton
                animation="wave"
                variant="rect"
                width="219"
                height="219"
              />
            )}
          </a>
        </div>
        <div className="Product__details">
          <p className="Product__text_overflow">
            <a
              href={`https://goerli.etherscan.io/address/${nft.nftAddress}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              {nft.nftAddress}
            </a>
          </p>
        </div>
        <div className="Product__details">
          <p className="Product__text_overflow">
            <span className="Product__label">Token id</span>
            <span className="Product__value">{nft.tokenId}</span>
          </p>
        </div>
        <div className="Product__details" style={{ marginTop: "8px" }}>
          {isLending(nft) ? (
            <StopLendButton lending={nft} handleStopLend={handleStopLend} />
          ) : (
            <LendButton nft={nft} handleLend={handleLend} />
          )}
        </div>
      </div>
    </div>
  );
};

// todo: iLend is an extra degree of freedom that is not required
// iLend can be inferred from the type of nfts. Moreover,
// we should not use the union type here for NFT and Lending.
// Cleanly separate these two, potentially into different components
const LendCatalogue: React.FC<LendCatalogueProps> = ({ nfts, iLend }) => {
  const { user } = useContext(GraphContext);
  const { rent } = useContext(ContractsContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [nft, setNft] = useState<Nft>();
  const [freshlyLent, setFreshlyLent] = useState<Nft>({
    nftAddress: "",
    tokenId: "",
  });

  const handleLend = useCallback(
    (_nft: Nft) => {
      setModalOpen(true);
      setNft(_nft);
    },
    [setModalOpen, setNft]
  );

  const handleStopLend = useCallback(
    async (lending: Lending) => {
      await rent.stopLendingOne(
        lending.nftAddress,
        String(lending.tokenId),
        String(lending.id)
      );
    },
    [rent]
  );

  const handleLendModal = useCallback((_nft: Nft) => {
    setFreshlyLent(_nft);
  }, []);

  return (
    <Box>
      <LendModal
        nft={nft}
        open={modalOpen}
        setOpen={setModalOpen}
        onLend={handleLendModal}
      />
      <Box className="Catalogue">
        {!iLend &&
          nfts?.length > 0 &&
          nfts.map((nft) => {
            const nftId = `${nft.nftAddress}::${nft.tokenId}`;
            if (
              nft.nftAddress === freshlyLent.nftAddress &&
              nft.tokenId === freshlyLent.tokenId
            )
              return <React.Fragment key={nftId} />;

            return (
              <CatalogueItem
                key={nftId}
                nftId={nftId}
                nft={nft}
                handleLend={handleLend}
                handleStopLend={handleStopLend}
              />
            );
          })}
        {iLend &&
          user.lending.length > 0 &&
          user.lending.map((lending) => {
            const nftId = `${lending.nftAddress}::${lending.tokenId}`;
            return (
              <CatalogueItem
                key={nftId}
                nftId={nftId}
                nft={lending}
                handleLend={handleLend}
                handleStopLend={handleStopLend}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default LendCatalogue;
