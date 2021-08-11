import { BigNumber, ethers } from "ethers";

export const SECOND_IN_MILLISECONDS = 1_000;

export const DP18 = ethers.utils.parseEther("1");
export const DP9 = BigNumber.from(1000_000_000);

export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const RENFT_SUBGRAPH_ID_SEPARATOR = "::";

export const IS_PROD =
  process.env["NODE_ENV"]?.toLowerCase() === "production";

export const NO_COLLECTION  = 'No collection'