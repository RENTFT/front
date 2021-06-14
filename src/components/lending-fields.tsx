import React from "react";
import NumericField from "./numeric-field";
import { PaymentToken } from "../types";
import { Lending } from "../contexts/graph/classes";

const LendingFields: React.FC<{ nft: Lending }> = ({ nft }) => {
  const days = parseInt(String(nft.lending.maxRentDuration), 10);
  return (
    <>
      <NumericField
        text="Daily price"
        value={nft.lending.dailyRentPrice.toString()}
        unit={PaymentToken[nft.lending.paymentToken]}
      />
      <NumericField
        text="Max duration"
        value={String(days)}
        unit={days > 1 ? "days" : "day"}
      />
      <NumericField
        text="Collateral"
        value={nft.lending.nftPrice.toString()}
        unit={PaymentToken[nft.lending.paymentToken]}
      />
    </>
  );
};

export default LendingFields;
