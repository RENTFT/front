import React, { useContext, useState, useMemo, useEffect } from "react";
import { Box } from "@material-ui/core";

// contexts
import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import LendCatalogue from "./LendCatalogue";

import { Face, Nft } from "../types";

type LendProps = {
  hidden: boolean;
};

const Lend: React.FC<LendProps> = ({ hidden }) => {
  const isValid = (data?: Face[]) => {
    return data != null && data.length > 0;
  };

  const { wallet } = useContext(DappContext);
  const { nfts, user } = useContext(GraphContext);
  const [data, setData] = useState<Face[]>();
  const dataIsValid = useMemo(() => {
    return isValid(data);
  }, [data]);
  useEffect(() => {
    if (user == null || wallet == null || !wallet.account) {
      console.debug("no user data yet");
      return;
    }
    // const currentLending = user.lending.map((item) => item.id);
    // // TODO: O(N**2) time complexity is shit
    // const resolvedData = user.faces.filter(
    //   (item) => !currentLending.includes(item.id)
    // );
    setData(user.faces);
  }, [nfts, user, wallet]);

  if (hidden) {
    return <></>;
  }

  return (
    <Box>
      {dataIsValid && (
        <Box>
          <ScrollForMore />
          <LendCatalogue data={data} />
        </Box>
      )}
      {!dataIsValid && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Lend;