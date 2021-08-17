import React, { useContext, useMemo, useCallback } from "react";
import { Nft } from "../../contexts/graph/classes";
import { nftId } from "../../services/firebase";
import { CatalogueItemRow } from "./catalogue-item-row";
import { Checkbox } from "../common/checkbox";
import UserContext from "../../contexts/UserProvider";
import { Skeleton } from "./skeleton";
import { CatalogueItemDisplay } from "./catalogue-item-display";

import { useRouter } from "next/router";
import { useNftMetaState } from "../../hooks/useMetaState";
import shallow from "zustand/shallow";
import { Flipped, spring } from "react-flip-toolkit";
import { CopyLink } from "../copy-link";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
  onCheckboxChange: () => void;
  disabled?: boolean;
};

const onElementAppear = (el: HTMLElement, index: number) =>
  spring({
    onUpdate: (val) => {
      el.style.opacity = val.toString();
    },
    delay: index * 50,
  });

const onExit =
  (type: "grid" | "list") =>
  (el: HTMLElement, index: number, removeElement: () => void) => {
    spring({
      config: { overshootClamping: true },
      onUpdate: (val) => {
        el.style.transform = `scale${type === "grid" ? "X" : "Y"}(${
          1 - Number(val)
        })`;
      },
      delay: index * 50,
      onComplete: removeElement,
    });

    return () => {
      el.style.opacity = "";
      removeElement();
    };
  };

export const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  onCheckboxChange,
  children,
  disabled,
}) => {
  const { signer } = useContext(UserContext);
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[nft.nId] || {};
      },
      [nft.nId]
    ),
    shallow
  );

  const { pathname } = useRouter();
  const imageIsReady = useMemo(() => {
    return meta && !meta.loading;
  }, [meta]);

  const { name, image, description, openseaLink } = meta;

  const isRentPage = useMemo(() => {
    return pathname === "/" || pathname.includes("/rent");
  }, [pathname]);

  const shouldFlip = useCallback((prev, current) => {
    if (prev.type !== current.type) {
      return true;
    }
    return false;
  }, []);

  const knownContract = useMemo(() => {
    return (
      nft.address.toLowerCase() === "0x0db8c099b426677f575d512874d45a767e9acc3c"
    );
  }, [nft.address]);

  return (
    <Flipped
      key={nft.id}
      flipId={nft.id}
      onAppear={onElementAppear}
      onExit={onExit("grid")}
      stagger={true}
    >
      <div
        className={`nft ${checked ? "checked" : ""} ${
          nft.isERC721 ? "nft__erc721" : "nft__erc1155"
        }`}
        key={nft.tokenId}
        data-item-id={nft.tokenId}
      >
        {!imageIsReady && <Skeleton />}
        {imageIsReady && (
          <>
            <Flipped
              flipId={`${nft.id}-content`}
              translate
              shouldFlip={shouldFlip}
              delayUntil={nft.id}
            >
              <>
                <div className="nft__overlay">
                  <a
                    className="nft__link"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://rarible.com/token/${nft.address}:${nft.tokenId}`}
                  >
                    <img src="/assets/rarible.png" className="nft__icon" />
                  </a>
                  {openseaLink && (
                    <a
                      className="nft__link"
                      target="_blank"
                      rel="noreferrer"
                      href={openseaLink}
                    >
                      <img src="/assets/opensea.png" className="nft__icon" />
                    </a>
                  )}
                  {/* <CatalogueActions
              address={nft.address}
              tokenId={nft.tokenId}
              id={id}
              isAlreadyFavourited={!!isAlreadyFavourited}
            /> */}
                  <div className="spacer" />
                  <Checkbox
                    checked={!!checked}
                    onChange={onCheckboxChange}
                    disabled={disabled || !signer}
                  ></Checkbox>
                </div>
                <div className="nft__image">
                  <CatalogueItemDisplay
                    image={image}
                    description={description}
                  />
                </div>
                <div className="nft__name">
                  {name}
                  {knownContract && (
                    <a className="nft__link" target="_blank" rel="noreferrer">
                      <img
                        src="/assets/nft-verified.png"
                        className="nft__icon small"
                      />
                    </a>
                  )}
                  {isRentPage && (
                    <CopyLink address={nft.address} tokenId={nft.tokenId} />
                  )}
                </div>
              </>
            </Flipped>
            <Flipped
              flipId={`${nft.id}-button`}
              shouldFlip={shouldFlip}
              delayUntil={nft.id}
            >
              <>
                <CatalogueItemRow
                  text="Address"
                  value={
                    <a
                      href={`https://etherscan.io/address/${nft.address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {nft.address}
                    </a>
                  }
                />
                <CatalogueItemRow text="Token id" value={nft.tokenId} />
                <CatalogueItemRow
                  text="Standard"
                  value={nft.isERC721 ? "721" : "1155"}
                />

                {children}
                {/* <CatalogueItemRow text="priceInUSD" value={nft.priceInUSD} /> */}
                {/* <CatalogueItemRow text="collateralInUSD" value={nft.collateralInUSD} /> */}
              </>
            </Flipped>
          </>
        )}
      </div>
    </Flipped>
  );
};
