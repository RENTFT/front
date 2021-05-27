import React, { useCallback, useEffect } from "react";
import ActionButton from "../components/action-button";
import { ReturnNft, useReturnIt } from "../hooks/useReturnIt";
import Modal from "./modal";


type ReturnModalProps = {
  nfts: ReturnNft[];
  open: boolean;
  onClose: () => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const [nft] = nfts;
  const {isApproved, approveAll, returnIt} = useReturnIt(nfts);

  useEffect(()=>{
    console.log(nfts)
  },[nfts])
  const handleReturnNft = useCallback(async () => {
    const isSuccess = await returnIt();
    if (isSuccess) {
      onClose();
    }
  }, [returnIt, onClose]);

  const handleApproveAll = useCallback( () => {
    approveAll()
  }, [approveAll]);
 

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
        <div className="modal-dialog-button">
          {!isApproved && (
            <ActionButton<ReturnNft>
              title="Approve All"
              nft={nft}
              onClick={handleApproveAll}
            />
          )}
          {isApproved && (
            <ActionButton<ReturnNft>
              title="Return It"
              nft={nft}
              onClick={handleReturnNft}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
