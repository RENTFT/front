import React, { useCallback, useContext, useMemo } from "react";
import { Lending, Nft } from "../../../contexts/graph/classes";
import { TimestampContext } from "../../../contexts/TimestampProvider";
import { isClaimable } from "../../../hooks/useBatchItems";
import { Tr, Td } from "react-super-responsive-table";
import Checkbox from "../../common/checkbox";
import { ShortenPopover } from "../../common/shorten-popover";
import { PaymentToken } from "@renft/sdk";
import { Tooltip } from "@material-ui/core";
import { Button } from "../../common/button";

export const LendingRow: React.FC<{
  lend: Lending & { relended: boolean };
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  checked: boolean;
  hasRenting: boolean;
  openClaimModal: (t: boolean) => void;
  openLendModal: (t: boolean) => void;
}> = ({
  lend,
  checkBoxChangeWrapped,
  checked,
  hasRenting,
  openLendModal,
  openClaimModal
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

  const formatCollateral = (v: number) => {
    const parts = v.toString().split(".");
    if (parts.length === 1) {
      return v.toString();
    }
    const wholePart = parts[0];
    const decimalPart = parts[1];
    return `${wholePart}.${decimalPart.substring(0, 4)}`;
  };

  const handleClaim = useCallback(() => {
    if (!claimable) return;
    checkBoxChangeWrapped(lend)();
    openClaimModal(true);
  }, [claimable, checkBoxChangeWrapped, lend, openClaimModal]);

  const handleClickLend = useCallback(() => {
    checkBoxChangeWrapped(lend)();
    openLendModal(true);
  }, [checkBoxChangeWrapped, lend, openLendModal]);

  const onRowClick = useCallback(() => {
    if (hasRenting && !claimable) return;
    checkBoxChangeWrapped(lend)();
  }, [checkBoxChangeWrapped, lend, hasRenting, claimable]);
  const claimTooltip = claimable
    ? "The NFT renting period is over. Click to claim your collateral."
    : hasRenting
    ? lend.lending.collateralClaimed
      ? "The item is already claimed"
      : "The item rental is not expired yet."
    : "No one rented the item as so far.";
  const lendTooltip = hasRenting
    ? "The item is rented out. You have to wait until the renter returns the item."
    : "Click to stop lending this item.";
  return (
    <Tr onClick={onRowClick}>
      <Td className="action-column">
        <Checkbox
          onChange={checkBoxChangeWrapped(lend)}
          checked={checked}
          disabled={hasRenting && !claimable}
        />
      </Td>
      <Td className="column">
        <ShortenPopover longString={lending.nftAddress}></ShortenPopover>
      </Td>
      <Td className="column">
        <ShortenPopover longString={lending.tokenId}></ShortenPopover>
      </Td>
      <Td className="column">{lend.amount}</Td>
      <Td className="column">{PaymentToken[lending.paymentToken ?? 0]}</Td>
      <Td className="column">
        {formatCollateral(lending.nftPrice * Number(lend.amount))}
      </Td>
      <Td className="column">{lending.dailyRentPrice}</Td>
      <Td className="column">{lending.maxRentDuration} days</Td>
      <Td className="column">{lend.relended ? "renter" : "owner"}</Td>
      <Td className="action-column">
        <Tooltip title={claimTooltip} aria-label={claimTooltip}>
          <span>
            <Button
              onClick={handleClaim}
              disabled={checked || !claimable}
              description="Claim"
            />
          </span>
        </Tooltip>
      </Td>
      <Td className="action-column">
        <Tooltip title={lendTooltip} aria-label={lendTooltip}>
          <span>
            <Button
              onClick={handleClickLend}
              disabled={checked || hasRenting}
              description="Stop lend"
            />
          </span>
        </Tooltip>
      </Td>
    </Tr>
  );
};
