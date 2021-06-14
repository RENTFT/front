import React, { useState, useCallback, useContext, useEffect } from "react";
import { Nft } from "../../contexts/graph/classes";
import ItemWrapper from "../../components/items-wrapper";
import BatchLendModal from "../../modals/batch-lend";
import CatalogueItem from "../../components/catalogue-item";
import ActionButton from "../../components/action-button";
import CatalogueLoader from "../../components/catalogue-loader";
import BatchBar from "../../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems,
} from "../../controller/batch-controller";
import Pagination from "../../components/pagination";
import { usePageController } from "../../controller/page-controller";
import { NFTMetaContext } from "../../contexts/NftMetaState";
import { useAllAvailableToLend } from "../../contexts/graph/hooks/useAllAvailableToLend";
import PageLayout from "../../components/page-layout";

export const Lendings: React.FC = () => {
  const { checkedItems, handleReset, onCheckboxChange, checkedNftItems } =
    useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit,
  } = usePageController<Nft>();
  const { allAvailableToLend, isLoading } = useAllAvailableToLend();
  const [modalOpen, setModalOpen] = useState(false);
  const [_, fetchNfts] = useContext(NFTMetaContext);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    handleReset();
  }, [setModalOpen, handleReset]);

  const handleStartLend = useCallback(
    async (nft: Nft) => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [setModalOpen, onCheckboxChange]
  );

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  useEffect(() => {
    onPageControllerInit(allAvailableToLend);
  }, [allAvailableToLend, onPageControllerInit]);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You don&apos;t have any NFTs to lend</div>;
  }

  return (
    <PageLayout
      title="AVAILABLE TO LEND" 
      toggleValue
      url="/lend/user-is-lending"
    >
      {modalOpen && (
        <BatchLendModal
          nfts={checkedNftItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft) => {
          const checked = !!checkedItems[getUniqueCheckboxId(nft)];

          return (
            <CatalogueItem
              key={getUniqueCheckboxId(nft)}
              nft={nft}
              checked={checked}
              onCheckboxChange={checkBoxChangeWrapped(nft)}
            >
              <ActionButton<Nft>
                nft={nft}
                title="Lend now"
                onClick={handleStartLend}
                disabled={checked}
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
      {checkedNftItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedNftItems.length} items`}
          actionTitle="Lend All"
          onCancel={handleReset}
          onClick={handleBatchModalOpen}
        />
      )}
    </PageLayout>
  );
};


export default Lendings;