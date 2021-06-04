import React, { useState, useCallback, useContext, useMemo, useEffect } from "react";
import moment from "moment";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { Lending, Nft, Renting } from "../contexts/graph/classes";
import {
  getUniqueCheckboxId,
  isClaimable,
  useBatchItems,
} from "../controller/batch-controller";
import { TransactionStateContext } from "../contexts/TransactionState";
import CatalogueLoader from "../components/catalogue-loader";
import { PaymentToken } from "../types";
import { short } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { useStopLend } from "../hooks/useStopLend";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { UserLendingContext } from "../contexts/UserLending";
import { UserRentingContext } from "../contexts/UserRenting";
import { useReturnIt } from "../hooks/useReturnIt";
import { useClaimColleteral } from "../hooks/useClaimColleteral";
import MultipleBatchBar from "../components/multiple-batch-bar";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Address } from "../components/address";
import Checkbox from "../components/checkbox";
import { TimestampContext } from "../contexts/TimestampProvider";

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW,
}

type StopLendButtonProps = {
  handleStopLend: (lending: Lending[]) => void;
  lend: Lending;
  disabled?: boolean;
};

type ClaimColleteralButtonProps = {
  claimColleteral: (lending: Lending[]) => void;
  lend: Lending;
  disabled?: boolean;
  claimable: boolean;
};

type ReturnNftButtonProps = {
  handleReturnNft: (renting: Renting[]) => void;
  rent: Renting;
  disabled?: boolean;
};

const ReturnNftButton: React.FC<ReturnNftButtonProps> = ({
  handleReturnNft,
  rent,
  disabled,
}) => {
  const handleClick = useCallback(() => {
    return handleReturnNft([rent]);
  }, [handleReturnNft, rent]);
  return (
    <button
      className={`nft__button small ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={disabled}
    >
      Return It
    </button>
  );
};

const StopLendButton: React.FC<StopLendButtonProps> = ({
  handleStopLend,
  lend,
  disabled,
}) => {
  const handleClick = useCallback(() => {
    return handleStopLend([lend]);
  }, [handleStopLend, lend]);
  return (
    <button
      className={`nft__button small ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={disabled}
    >
      Stop lend
    </button>
  );
};

const ClaimCollateralButton: React.FC<ClaimColleteralButtonProps> = ({
  claimColleteral,
  lend,
  disabled,
  claimable,
}) => {
  const handleClick = useCallback(() => {
    if (!claimable) return;
    return claimColleteral([lend]);
  }, [claimColleteral, lend, claimable]);
  return (
    <button
      className={`nft__button small ${claimable ? "" : "disabled"}`}
      disabled={disabled}
      onClick={handleClick}
    >
      Claim
    </button>
  );
};

// TODO: This code is not DRY
// TODO: lendings has This batch architecture too
// TODO: it would be good to absTract batching
// TODO: and pass components as children to The absTracted
// TODO: so That we do not repeat This batch code everywhere
export const Dashboard: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const {
    onCheckboxChange,
    handleResetLending,
    checkedItems,
    checkedLendingItems,
    checkedRentingItems,
    checkedClaims,
  } = useBatchItems();
  const { userRenting: rentingItems, isLoading: userRentingLoading } =
    useContext(UserRentingContext);
  const { userLending: lendingItems, isLoading: userLendingLoading } =
    useContext(UserLendingContext);
  const { setHash } = useContext(TransactionStateContext);
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );
  const stopLending = useStopLend();
  const claim = useClaimColleteral();
  
  const claimCollateral = useCallback(
    async (items: Lending[]) => {
      const claims = items.map((lending) => ({
        address: lending.address,
        tokenId: lending.tokenId,
        lendingId: lending.id,
        amount: lending.amount,
      }));
      claim(claims)
        // @ts-ignore
        .then((tx) => {
          if (tx) return setHash(tx.hash);
          return Promise.resolve();
        })
        .then(() => {
          handleResetLending();
        });
    },
    [claim, handleResetLending, setHash]
  );

  const claimCollateralAll = useCallback(() => {
    claimCollateral(checkedLendingItems);
  }, [checkedLendingItems, claimCollateral]);
  const handleStopLend = useCallback(
    (lending: Lending[]) => {
      const Transaction = createCancellablePromise(
        stopLending(
          lending.map((l) => ({
            address: l.address,
            amount: l.amount,
            lendingId: l.lending.id,
            tokenId: l.tokenId,
          }))
        )
      );

      Transaction.promise
        .then((tx) => {
          if (tx) setHash(tx.hash);
          return Promise.resolve(false);
        })
        .then((status) => {
          if (status) handleResetLending(lending.map((m) => m.id));
        });
    },
    [stopLending, setHash, handleResetLending]
  );
  const isLoading = userLendingLoading || userRentingLoading;

  const returnItems = useMemo(() => {
    return checkedRentingItems.map((item) => ({
      id: item.id,
      address: item.address,
      tokenId: item.tokenId,
      lendingId: item.renting.lendingId,
      amount: item.renting.lending.lentAmount,
      contract: item.contract,
    }));
  }, [checkedRentingItems]);

  const lendinItemsStopLendable = useMemo(() => {
    return checkedLendingItems.filter((v) => !v.lending);
  }, [checkedLendingItems]);
  const returnIt = useReturnIt(returnItems);
  const handleStopLendAll = useCallback(() => {
    return handleStopLend(lendinItemsStopLendable);
  }, [handleStopLend, lendinItemsStopLendable]);

  const handleReturnNft = useCallback(
    (nft) => {
      onCheckboxChange(nft);
      returnIt();
    },
    [onCheckboxChange, returnIt]
  );

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );
  if (isLoading && lendingItems.length === 0 && rentingItems.length === 0)
    return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center">You aren&apos;t lending or renting anyThing</div>
    );
  }

  const arr = [];
  if (checkedClaims.length > 0) {
    arr.push(`Selected ${checkedClaims.length} items to claim`);
  }
  if (lendinItemsStopLendable.length > 0) {
    arr.push(`Selected ${lendinItemsStopLendable.length} items to stop lend`);
  }
  const batchBarTitle = arr.join("\n");
  return (
    <div>
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="dashboard-list-view">
          {lendingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="lending">Lending</h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find The NFTs That you are lending. These can also
                be found in The Lending tab after you toggle The view.
              </h3>
              <Table className="list">
                <Thead>
                  <Tr>
                    <Th style={{ widTh: "15%" }}>Address</Th>
                    <Th style={{ widTh: "7%" }}>ID</Th>
                    <Th style={{ widTh: "5%" }}>Amount</Th>
                    <Th style={{ widTh: "5%" }}>Pmt in</Th>
                    <Th style={{ widTh: "11%" }}>Collateral</Th>
                    <Th style={{ widTh: "7%" }}>Rent</Th>
                    <Th style={{ widTh: "7%" }}>Duration</Th>
                    <Th style={{ widTh: "7%" }}>Batch Select</Th>
                    <Th style={{ widTh: "10%" }} className="action-column">
                      &nbsp;
                    </Th>
                    <Th style={{ widTh: "10%" }} className="action-column">
                      &nbsp;
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lendingItems.map((lend: Lending) => {
                    const id = getUniqueCheckboxId(lend);
                    const hasRenting = !!lend.renting;
                    const checked = !!checkedItems[id];
                    return (
                      <LendingRow
                        key={id}
                        hasRenting={hasRenting}
                        checked={checked}
                        lend={lend}
                        claimCollateral={claimCollateral}
                        handleStopLend={handleStopLend}
                        checkBoxChangeWrapped={checkBoxChangeWrapped}
                      ></LendingRow>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          )}
          {rentingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="renting">Renting</h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find The NFTs That you are renting. These can also
                be found in The renting tab, after you toggle The view.
              </h3>
              <Table className="list">
                <Thead>
                  <Tr>
                    <Th style={{ widTh: "15%" }}>Address</Th>
                    <Th style={{ widTh: "5%" }}>ID</Th>
                    <Th style={{ widTh: "5%" }}>Amount</Th>
                    <Th style={{ widTh: "7%" }}>Pmt in</Th>
                    <Th style={{ widTh: "7%" }}>Collateral</Th>
                    <Th style={{ widTh: "11%" }}>Rented On</Th>
                    <Th style={{ widTh: "7%" }}>Duration</Th>
                    <Th style={{ widTh: "7%" }}>Due Date</Th>
                    <Th style={{ widTh: "7%" }}>Batch Select</Th>
                    <Th style={{ widTh: "20%" }} className="action-column">
                      &nbsp;
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rentingItems.map((rent: Renting) => {
                    const renting = rent.renting;
                    const checked = !!checkedItems[getUniqueCheckboxId(rent)];
                    return (
                      <Tr key={getUniqueCheckboxId(rent)}>
                        <Td className="column">
                          {short(renting.lending.nftAddress)}
                        </Td>
                        <Td className="column">{rent.tokenId}</Td>
                        <Td className="column">{renting.lending.lentAmount}</Td>
                        <Td className="column">
                          {PaymentToken[renting.lending.paymentToken ?? 0]}
                        </Td>
                        <Td className="column">{renting.rentDuration} days</Td>
                        <Td className="column">
                          {moment(Number(renting.rentedAt) * 1000).format(
                            "MM/D/YY hh:mm"
                          )}
                        </Td>
                        <Td className="column">{renting.rentDuration} days</Td>
                        <Td className="column">
                          {renting.lending.dailyRentPrice}
                        </Td>
                        <Td className="action-column">
                          <Checkbox
                            handleClick={checkBoxChangeWrapped(rent)}
                            checked={checked}
                          />
                        </Td>
                        <Td className="action-column">
                          {renting.lending.lenderAddress !==
                            currentAddress.toLowerCase() && (
                            <ReturnNftButton
                              handleReturnNft={handleReturnNft}
                              rent={rent}
                              disabled={checked}
                            />
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          )}
        </div>
      )}
      <MultipleBatchBar
        title={batchBarTitle}
        claimsNumber={checkedClaims.length}
        rentingNumber={checkedRentingItems.length}
        lendingNumber={lendinItemsStopLendable.length}
        onClaim={claimCollateralAll}
        onStopRent={returnIt}
        onStopLend={handleStopLendAll}
      />
    </div>
  );
};

// this keeps rerendering
export const LendingRow: React.FC<{
  lend: Lending;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  checked: boolean;
  hasRenting: boolean;
  handleStopLend: (lending: Lending[]) => void;
  claimCollateral: (lending: Lending[]) => void;
}> = ({
  lend,
  checkBoxChangeWrapped,
  checked,
  hasRenting,
  handleStopLend,
  claimCollateral,
}) => {
  const lending = lend.lending;
  const blockTimeStamp = useContext(TimestampContext);
  const claimable = useMemo(
    () =>
      !!(
        lend.renting &&
        isClaimable(lend.renting, blockTimeStamp) &&
        !lend.lending.collateralClaimed
      ),
    [lend, blockTimeStamp]
  );
  useEffect(() =>{
    console.log('claimable', lend.id, claimable, lend.lending.collateralClaimed, blockTimeStamp)
  }, [blockTimeStamp, claimable, lend.id, lend.lending.collateralClaimed])
  return (
    <Tr>
      <Td className="column">
        <Address address={lending.nftAddress}></Address>
      </Td>
      <Td className="column">{lend.tokenId}</Td>
      <Td className="column">{lend.amount}</Td>
      <Td className="column">{PaymentToken[lending.paymentToken ?? 0]}</Td>
      <Td className="column">{lending.nftPrice}</Td>
      <Td className="column">{lending.dailyRentPrice}</Td>
      <Td className="column">{lending.maxRentDuration} days</Td>
      <Td className="action-column">
        <Checkbox
          handleClick={checkBoxChangeWrapped(lend)}
          checked={checked}
          disabled={hasRenting && !claimable}
        />
      </Td>
      <Td className="action-column">
        <ClaimCollateralButton
          claimColleteral={claimCollateral}
          lend={lend}
          claimable={claimable}
          disabled={checked}
        />
      </Td>
      <Td className="action-column">
        <StopLendButton
          handleStopLend={handleStopLend}
          lend={lend}
          disabled={checked || hasRenting}
        />
      </Td>
    </Tr>
  );
};

export default React.memo(Dashboard);
