import React, { useState, useCallback } from "react";
import Rentings from "../catalogue/rent/rentings";
import UserRentings from "../catalogue/rent/user-rentings";
import PageLayout from "../layout/page-layout";

enum RentSpecificity {
  ALL,
  RENTING,
}

export const Rent: React.FC = () => {
  const [specificity, setSpecificiy] = useState<RentSpecificity>(
    RentSpecificity.ALL
  );

  const switchSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === RentSpecificity.ALL
        ? RentSpecificity.RENTING
        : RentSpecificity.ALL
    );
  }, []);

  return (
    <PageLayout
      title={specificity.valueOf() === 0 ? "AVAILABLE TO RENT" : "RENTING"}
      toggleValue={specificity === RentSpecificity.RENTING}
      onSwitch={switchSpecificity}
    >
      {specificity === RentSpecificity.RENTING && <UserRentings />}
      {specificity === RentSpecificity.ALL && <Rentings />}
    </PageLayout>
  );
};

export default Rent;
