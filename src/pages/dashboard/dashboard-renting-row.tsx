import moment from 'moment';
import React, { useCallback } from 'react';
import { Renting } from '../../contexts/graph/classes';
import { Tr, Td } from "react-super-responsive-table";
import Checkbox from '../../components/common/checkbox';
import { short } from '../../utils';
import { PaymentToken } from '@renft/sdk';
import { CountDown } from '../../components/common/countdown';
import { Tooltip } from '@material-ui/core';
import { Button } from '../../components/common/button';

export const RentingRow: React.FC<{
    checked: boolean;
    rent: Renting & { relended: boolean };
    openModal: (t: boolean) => void;
    currentAddress: string;
    checkBoxChangeWrapped: (nft: Renting) => () => void;
    isExpired: boolean;
  }> = ({
    checked,
    rent,
    checkBoxChangeWrapped,
    currentAddress,
    isExpired,
    openModal
  }) => {
    const renting = rent.renting;
    const handleClick = useCallback(() => {
      checkBoxChangeWrapped(rent)();
      openModal(true);
    }, [checkBoxChangeWrapped, openModal]);
    const handleRowClicked = useCallback(() => {
      if (isExpired || rent.relended) return;
      checkBoxChangeWrapped(rent)();
    }, [checkBoxChangeWrapped, rent, isExpired]);
    const days = renting.rentDuration;
  
    const formatCollateral = (v: number) => {
      const parts = v.toString().split(".");
      if (parts.length === 1) { return v.toString(); }
      const wholePart = parts[0];
      const decimalPart = parts[1];
      return `${wholePart}.${decimalPart.substring(0, 4)}`
    }

    const expireDate = moment(Number(renting.rentedAt) * 1000).add(
      renting.rentDuration,
      "day"
    );
    let tooltip = "Return NFT";
    tooltip = isExpired
      ? "The NFT is expired. You cannot return it anymore."
      : tooltip;
    tooltip = rent.relended
      ? "Please stop lending this item first. Then you can return it!"
      : tooltip;
    return (
      <Tr onClick={handleRowClicked}>
        <Td className="action-column">
          <Checkbox
            handleClick={checkBoxChangeWrapped(rent)}
            checked={checked}
            disabled={isExpired || rent.relended}
          />
        </Td>
        <Td className="column">{short(renting.lending.nftAddress)}</Td>
        <Td className="column">{rent.tokenId}</Td>
        <Td className="column">{renting.lending.lentAmount}</Td>
        <Td className="column">
          {PaymentToken[renting.lending.paymentToken ?? 0]}
        </Td>
        <Td className="column">
          {formatCollateral(renting.lending.nftPrice * Number(renting.lending.lentAmount))}
        </Td>
        <Td className="column">{renting.lending.dailyRentPrice}</Td>
        <Td className="column">
          {days} {days > 1 ? "days" : "day"}
        </Td>
  
        <Td className="column">
          {moment(Number(renting.rentedAt) * 1000).format("MM/D/YY hh:mm")}
        </Td>
        <Td className="column">
          <CountDown endTime={expireDate.toDate().getTime()} />
        </Td>
  
        <Td className="action-column">
          {renting.lending.lenderAddress !== currentAddress.toLowerCase() && (
            <Tooltip title={tooltip} aria-label={tooltip}>
              <span>
                <Button
                  handleClick={handleClick}
                  disabled={checked || isExpired || rent.relended}
                  description="Return it"
                />
              </span>
            </Tooltip>
          )}
        </Td>
      </Tr>
    );
  };
  