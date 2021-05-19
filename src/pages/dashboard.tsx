import React, { useState, useCallback, useContext, useEffect } from "react";
import moment from "moment";

import GraphContext from "../contexts/graph/index";
import { Lending, Renting } from "../contexts/graph/classes";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { BatchContext, getUniqueID } from "../controller/batch-controller";
import { TransactionStateContext } from "../contexts/TransactionState";
import CatalogueLoader from "../components/catalogue-loader";
import { PaymentToken } from "../types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import stopLend from "../services/stop-lend";
import claimCollateral from "../services/claim-collateral";
import { ReNFTContext } from "../hardhat/SymfoniContext";
import { getLendingPriceByCurreny, short } from "../utils";
import BatchBar from "../components/batch-bar";

const returnBy = (rentedAt: number, rentDuration: number) => {
  return moment.unix(rentedAt).add(rentDuration, "days");
};

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW,
}

type CheckboxProps = {
  onCheckboxClick: (nft: Lending | Renting) => void;
  nft: Lending | Renting;
};

const Checkbox: React.FC<CheckboxProps> = ({ onCheckboxClick, nft }) => {
  const { checkedItems } = useContext(BatchContext);

  const handleClick = useCallback(() => {
    return onCheckboxClick(nft);
  }, [onCheckboxClick, nft]);

  return (
    <div
      onClick={handleClick}
      className={`checkbox ${
        checkedItems[getUniqueID(nft.address, nft.tokenId, nft.lending.id)]
          ? "checked"
          : ""
      }`}
      style={{ margin: "auto", marginTop: "1em" }}
    />
  );
};

// TODO: this code is not DRY
// TODO: lendings has this batch architecture too
// TODO: it would be good to abstract batching
// TODO: and pass components as children to the abstracted
// TODO: so that we do not repeat this batch code everywhere
export const Dashboard: React.FC = () => {
  const {
    checkedItems,
    checkedLendingItems,
    checkedRentingItems,
    onCheckboxChange,
    handleReset,
  } = useContext(BatchContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { getUserLending, getUserRenting } = useContext(GraphContext);
  const { instance: renft } = useContext(ReNFTContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lendingItems, setLendingItems] = useState<Lending[]>([]);
  const [rentingItems, setRentingItems] = useState<Renting[]>([]);
  const [__, setModalOpen] = useState(false);
  const { setHash } = useContext(TransactionStateContext);
  const _now = moment();
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );

  const handleRefresh = useCallback(() => {
    Promise.all([getUserLending(), getUserRenting()])
      .then(([userLending, userRenting]) => {
        setLendingItems(userLending || []);
        setRentingItems(userRenting || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not handle refresh");
      });
  }, [
    getUserLending,
    getUserRenting,
    setLendingItems,
    setRentingItems,
    setIsLoading,
  ]);

  const handleClaimCollateral = useCallback(
    async (lending: Lending) => {
      if (!renft) return;
      const tx = await claimCollateral(renft, [
        {
          address: lending.address,
          tokenId: lending.tokenId,
          lendingId: lending.id,
        },
      ]);
      await setHash(tx.hash);
      handleRefresh();
    },
    [renft, setHash, handleRefresh]
  );

  const handleStopLend = useCallback(
    async (lending: Lending[]) => {
      if (!renft) return;
      const tx = await stopLend(
        renft,
        lending.map((l) => ({
          address: l.address,
          amount: l.amount,
          lendingId: l.lending.id,
          tokenId: l.tokenId,
        }))
      );
      await setHash(tx.hash);
      handleRefresh();
      handleReset();
    },
    [renft, setHash, handleRefresh, handleReset]
  );

  const _returnBy = (renting: Renting) =>
    returnBy(renting.renting?.rentedAt, renting.renting?.rentDuration);

  const _claim = (renting: Renting) => _now.isAfter(_returnBy(renting));

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const onCheckboxClick = useCallback(
    (lending: Lending | Renting) => {
      onCheckboxChange(lending);
    },
    [onCheckboxChange]
  );

  useEffect(() => {
    setIsLoading(true);

    const getUserLendingRequest = createCancellablePromise(
      Promise.all([getUserLending(), getUserRenting()])
    );

    getUserLendingRequest.promise
      .then(([userLending, userRenting]) => {
        setLendingItems(userLending);
        setRentingItems(userRenting);
        setIsLoading(false);
      })
      .catch((e) => {
        console.warn(e);
        console.warn("could not get user lending and renting request");
      });

    return getUserLendingRequest.cancel;
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center">You aren&apos;t lending or renting anything</div>
    );
  }

  return (
    <div>
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="dashboard-list-view">
          {lendingItems.length !== 0 && !isLoading && (
            <div className="dashboard-section">
              <h2 className="lending">Lending</h2>
              <table className="list">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Address</th>
                    <th style={{ width: "7%" }}>ID</th>
                    <th style={{ width: "5%" }}>Amount</th>
                    <th style={{ width: "5%" }}>Pmt in</th>
                    <th style={{ width: "11%" }}>Collateral</th>
                    <th style={{ width: "7%" }}>Rent</th>
                    <th style={{ width: "7%" }}>Duration</th>
                    <th style={{ width: "7%" }}>Batch Select</th>
                    <th style={{ width: "20%" }} className="action-column">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lendingItems.map((lend: Lending) => {
                    const lending = lend.lending;
                    return (
                      <tr
                        key={getUniqueID(lend.address, lend.tokenId, lend.id)}
                      >
                        <td className="column">{short(lending.nftAddress)}</td>
                        <td className="column">{lend.tokenId}</td>
                        <td className="column">{lend.amount}</td>
                        <td className="column">
                          {PaymentToken[lending.paymentToken ?? 0]}
                        </td>
                        <td className="column">
                          {getLendingPriceByCurreny(
                            lending.nftPrice,
                            lending.paymentToken
                          )}
                        </td>
                        <td className="column">
                          {getLendingPriceByCurreny(
                            lending.dailyRentPrice,
                            lending.paymentToken
                          )}
                        </td>
                        <td className="column">
                          {lending.maxRentDuration} days
                        </td>
                        <td className="action-column">
                          <Checkbox
                            onCheckboxClick={onCheckboxClick}
                            nft={lend}
                          />
                        </td>
                        <td className="action-column">
                          {/* 
                            TODO: handleStopLend
                          */}
                          <span
                            className="nft__button small"
                            onClick={() => handleStopLend([lend])}
                          >
                            Stop lend
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {rentingItems.length !== 0 && !isLoading && (
            <div className="dashboard-section">
              <h2 className="renting">Renting</h2>
              <table className="list">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Address</th>
                    <th style={{ width: "5%" }}>ID</th>
                    <th style={{ width: "5%" }}>Amount</th>
                    <th style={{ width: "7%" }}>Pmt in</th>
                    <th style={{ width: "7%" }}>Collateral</th>
                    <th style={{ width: "11%" }}>Rented On</th>
                    <th style={{ width: "7%" }}>Duration</th>
                    <th style={{ width: "7%" }}>Due Date</th>
                    <th style={{ width: "7%" }}>Batch Select</th>
                    <th style={{ width: "20%" }} className="action-column">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentingItems.map((rent: Renting) => {
                    const renting = rent.renting;
                    return (
                      <tr
                        key={getUniqueID(
                          rent.lending.nftAddress,
                          rent.lending.tokenId,
                          renting.lendingId
                        )}
                      >
                        <td className="column">
                          {short(renting.lending.nftAddress)}
                        </td>
                        <td className="column">{rent.tokenId}</td>
                        <td className="column">{renting.lending.lentAmount}</td>
                        <td className="column">
                          {PaymentToken[renting.lending.paymentToken ?? 0]}
                        </td>
                        <td className="column">{renting.rentDuration} days</td>
                        <td className="column">
                          {moment(Number(renting.rentedAt) * 1000).format(
                            "MM/D/YY hh:mm"
                          )}
                        </td>
                        <td className="column">{renting.rentDuration} days</td>
                        <td className="column">
                          {renting.lending.dailyRentPrice}
                        </td>
                        <td className="action-column">
                          <Checkbox
                            onCheckboxClick={onCheckboxClick}
                            nft={rent}
                          />
                        </td>
                        <td className="action-column">
                          {renting.lending.lenderAddress !==
                            currentAddress.toLowerCase() && (
                            <span className="nft__button small">Return It</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {
        // TODO: should not be able to check some in lending and some in renting. Only one or the other
        // TODO: potential solution: just show the batchbar for one or the other at a time
        // TODO: force them to de-select in one or the other
        // TODO: best solution: show two batch bars stacked on top of each other
        // TODO: one for lending and one for renting
      }
      {checkedLendingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Stop Lend All"
          onCancel={handleReset}
          onClick={() => handleStopLend(checkedLendingItems)}
        />
      )}
      {checkedRentingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle="Return All"
          onCancel={handleReset}
          onClick={handleBatchModalOpen}
        />
      )}
      {
        // TODO: claim collateral all
      }
    </div>
  );
};

export default React.memo(Dashboard);
