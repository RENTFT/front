import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import ItemWrapper from "../../../components/items-wrapper";
import BatchLendModal from "../../../modals/batch-lend";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import { BatchContext } from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";

const Lendings: React.FC = () => {
  const {
    checkedItems,
    checkedMap,
    countOfCheckedItems,
    onReset,
    onCheckboxChange,
    onSetCheckedItem,
    onSetItems,
  } = useContext(BatchContext);
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext(PageContext);
  const { getUserNfts } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    getUserNfts().then((items: Nft[] | undefined) => {
      onChangePage(items || []);
      onSetItems(items || []);
      setIsLoading(false);
    });
  }, [setIsLoading, getUserNfts, onChangePage, onSetItems, setIsLoading]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    onReset();
    handleRefresh();
  }, [setModalOpen, onReset, handleRefresh]);

  const handleStartLend = useCallback(
    async (nft: Nft) => {
      onSetCheckedItem(nft);
      setModalOpen(true);
    },
    [setModalOpen, onSetCheckedItem]
  );

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  useEffect(() => {
    setIsLoading(true);

    const getUserNftsRequest = createCancellablePromise(getUserNfts());

    getUserNftsRequest.promise.then((items: Nft[] | undefined) => {
      onChangePage(items || []);
      onSetItems(items || []);
      setIsLoading(false);
    });

    return () => {
      onResetPage();
      return getUserNftsRequest.cancel();
    };
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You dont have any NFTs</div>;
  }

  return (
    <>
      {modalOpen && (
        <BatchLendModal
          nfts={checkedItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft) => (
          <CatalogueItem
            key={`${nft.address}::${nft.tokenId}`}
            nft={nft}
            checked={checkedMap[nft.tokenId] || false}
            onCheckboxChange={onCheckboxChange}
          >
            <ActionButton<Nft>
              nft={nft}
              title="Lend now"
              onClick={handleStartLend}
            />
          </CatalogueItem>
        ))}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
      {countOfCheckedItems > 1 && (
        <BatchBar
          title={`Batch process ${countOfCheckedItems} items`}
          actionTitle="Lend all"
          onCancel={onReset}
          onClick={handleBatchModalOpen}
        />
      )}
    </>
  );
};

export default React.memo(Lendings);
