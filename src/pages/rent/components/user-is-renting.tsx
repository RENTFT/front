import React, { useCallback, useEffect, useContext, useState } from "react";

import { Renting } from "../../../contexts/graph/classes";
import NumericField from "../../../components/common/numeric-field";
import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/common/items-wrapper";
import ReturnModal from "../../../modals/return-modal";
import ActionButton from "../../../components/common/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems
} from "../../../controller/batch-controller";
import { Nft } from "../../../contexts/graph/classes";
import Pagination from "../../../components/common/pagination";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { UserRentingContext } from "../../../contexts/UserRenting";
import { usePageController } from "../../../controller/page-controller";
import { nftReturnIsExpired } from "../../../utils";
import UserContext from "../../../contexts/UserProvider";
import { PaymentToken } from "@renft/sdk";


const UserRentings: React.FC = () => {
  const { signer } = useContext(UserContext);
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedRentingItems
  } = useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit
  } = usePageController<Renting>();
  const { userRenting, isLoading } = useContext(UserRentingContext);
  const [_, fetchNfts] = useContext(NFTMetaContext);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    handleBatchReset();
  }, [handleBatchReset]);

  const handleBatchStopRent = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleReturnNft = useCallback(
    (nft) => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [onCheckboxChange]
  );

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed)
      onPageControllerInit(userRenting.filter((nft) => nft.renting));
    return () => {
      isSubscribed = false;
    };
  }, [onPageControllerInit, userRenting]);

  //Prefetch metadata
  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) fetchNfts(currentPage);
    return () => {
      isSubscribed = false;
    };
  }, [currentPage, fetchNfts]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  if (!signer) {
    return (
      <div className="center content__message">Please connect your wallet!</div>
    );
  }
  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return (
      <div className="center content__message">
        You are not renting anything yet
      </div>
    );
  }

  return (
    <>
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={checkedRentingItems}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {currentPage.length > 0 &&
          currentPage.map((nft: Renting) => {
            const id = getUniqueCheckboxId(nft);
            const checked = !!checkedItems[id];
            const isExpired = nftReturnIsExpired(nft);
            const days = nft.renting.rentDuration;
            return (
              <CatalogueItem
                key={id}
                nft={nft}
                checked={checked}
                disabled={isExpired}
                onCheckboxChange={checkBoxChangeWrapped(nft)}
              >
                <NumericField
                  text="Daily price"
                  value={nft.lending.dailyRentPrice.toString()}
                  unit={PaymentToken[PaymentToken.DAI]}
                />
                <NumericField
                  text="Rent Duration"
                  value={days.toString()}
                  unit={days > 1 ? "days" : "day"}
                />
                <ActionButton<Nft>
                  title="Return It"
                  disabled={isExpired}
                  nft={nft}
                  onClick={() => handleReturnNft(nft)}
                />
              </CatalogueItem>
            );
          })}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
      {checkedRentingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle={
            checkedRentingItems.length > 1 ? "Return all NFTs" : "Return NFT"
          }
          onCancel={handleBatchReset}
          onClick={handleBatchStopRent}
        />
      )}
    </>
  );
};

export default React.memo(UserRentings);
