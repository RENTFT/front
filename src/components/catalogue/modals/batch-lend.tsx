import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { ProviderContext } from "../../../hardhat/SymfoniContext";
import { PaymentToken } from "../../../types";
import RainbowButton from "../../forms/rainbow-button";
import CssTextField from "../../forms/css-text-field";
import Modal from "./modal";
import MinimalSelect from "../../select";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import { Nft } from "../../../contexts/graph/classes";
import { useStyles } from "./styles";
import startLend from "../../../services/start-lend";
import isApprovalForAll from "../../../services/is-approval-for-all";
import ActionButton from "../../forms/action-button";

type LendOneInputs = {
  [key: string] : {
    [key: string]: string;
  }
};

type LendModalProps = {
  nfts: Nft[];
  open: boolean;
  onClose(): void;
};

export const BatchLendModal: React.FC<LendModalProps> = ({ nfts, open, onClose }) => {
  const classes = useStyles();
  const { instance: renft } = useContext(RentNftContext);
  const { isActive, setHash } = useContext(TransactionStateContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [pmtToken, setPmtToken] = useState<Record<string, PaymentToken>>({});
  const [provider] = useContext(ProviderContext);
  const [isApproved, setIsApproved] = useState<boolean>();
  const [nft] = nfts;
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({});
  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!renft || isActive || !nft.contract || !nft.tokenId) return;

      const lendOneInputsValues = Object.values(lendOneInputs);
      const maxDurationsValues = lendOneInputsValues.map(item => item['maxDuration']);
      const borrowPriceValues = lendOneInputsValues.map(item => item['borrowPrice']);
      const nftPriceValues = lendOneInputsValues.map(item => item['nftPrice']);
      const pmtTokens = Object.values(pmtToken);  
      const tx = await startLend(
        renft,
        nfts,
        maxDurationsValues,
        borrowPriceValues,
        nftPriceValues,
        pmtTokens
      );

      setHash(tx.hash);
      onClose();
    },
    [nft, renft, setHash, onClose, isActive, lendOneInputs, pmtToken]
  );

  const handleApproveAll = useCallback(
    async () => {
      if (!currentAddress || !renft || isActive || !provider) return;
      const contract = await nft.contract();
      const tx = await contract.setApprovalForAll(renft.address, true);
      setHash(tx.hash);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const status = receipt.status ?? 0;
      if (status === 1) {
        setIsApproved(true);
      }
    },
    [currentAddress, renft, isActive, setHash, provider, setIsApproved]
  );

  const handleStateChange = useCallback(
    (target: string, value: string) => {
      const [id, name] = target.split("::");      
      setLendOneInputs({
        ...lendOneInputs,
        [id]: {
          ...lendOneInputs[id],
          [name]: value
        }
      });
    },
    [lendOneInputs, setLendOneInputs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStateChange(e.target.name, e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleStateChange(e.target.name, e.target.value);
  };

  const onSelectPaymentToken = useCallback(
    (value: number, tokenId) => {
      setPmtToken({
          ...pmtToken,
          [tokenId]: value
      });
    },
    [pmtToken, setPmtToken]
  );

  useEffect(() => {
    if (!nft.contract || !renft || !currentAddress) return;
    const contract = nft.contract();
    isApprovalForAll(renft, contract, currentAddress).then((isApproved: boolean) => {
      setIsApproved(isApproved);
    }).catch(() => false);
  }, [isApproved, setIsApproved, nft, renft]);

  return (
    <Modal open={open} handleClose={onClose}>
      <form
        noValidate
        autoComplete="off"
        onSubmit={handleLend}
        className={classes.form}
        style={{ padding: "32px" }}
      >
        {nfts.map((nftItem: Nft) => {
            return (
              <div className="form-section" key={`${nftItem.address}::${nftItem.tokenId}`}>
                  <div className="for">Token Id: {nftItem.tokenId}</div>
                      <Box>
                      <div className="fields">
                        <Box className={classes.inputs}>
                          <CssTextField
                            required
                            label="Max lend duration"
                            id={`${nftItem.tokenId}::maxDuration`}
                            variant="outlined"
                            value={lendOneInputs[nftItem.tokenId]?.maxDuration ?? ""}
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name={`${nftItem.tokenId}::maxDuration`}
                          />
                        </Box>
                        <Box className={classes.inputs}>
                        <CssTextField
                          required
                          label="Borrow Price"
                          id={`${nftItem.tokenId}::borrowPrice`}
                          variant="outlined"
                          value={lendOneInputs[nftItem.tokenId]?.borrowPrice ?? ""}
                          type="number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name={`${nftItem.tokenId}::borrowPrice`}
                        />
                        </Box>
                        <Box className={classes.inputs}>
                        <CssTextField
                          required
                          label="Collateral"
                          id={`${nftItem.tokenId}::nftPrice`}
                          variant="outlined"
                          value={lendOneInputs[nftItem.tokenId]?.nftPrice ?? ""}
                          type="number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name={`${nftItem.tokenId}::nftPrice`}
                        />
                        </Box>
                        <Box className={classes.inputs}>
                        <FormControl variant="outlined">
                          <MinimalSelect
                            // @ts-ignore
                            onSelect={(value) => onSelectPaymentToken(value, nftItem.tokenId)}
                            selectedValue={pmtToken[nftItem.tokenId] ?? -1}
                          />
                        </FormControl>
                        </Box>
                  </div>
                  </Box>
              </div>  
            );
        })}
        <div className="float-button">
          <Box className={classes.buttons}>
            {!isApproved && (
              <ActionButton<Nft>
                title="Approve all"
                nft={nft}
                onClick={handleApproveAll}
              />
            )}
            {isApproved && (
              <RainbowButton type="submit" text="Lend" disabled={!isApproved} />
            )}
          </Box>
        </div>
      </form>
    </Modal>
  );
};

export default BatchLendModal;
