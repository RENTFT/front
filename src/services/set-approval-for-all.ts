import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import { ContractTransaction } from "ethers";

export default async function setApprovalForAll(
  nfts: { address: string; contract: () => ERC721 | ERC1155 }[],
  contractAddress: string
): Promise<ContractTransaction[]> {

  const distinctItems = nfts.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );

  return await Promise.all(
    distinctItems.map((nft) => {
      const contract = nft.contract();
      return contract.setApprovalForAll(contractAddress, true);
    })
  );
}
