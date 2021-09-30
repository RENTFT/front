import React from "react";
import { Button } from "./button";

type ActionButtonProps<T> = {
  nft: T;
  title: string;
  onClick: (nft: T) => void;
  disabled?: boolean;
  type?: 'submit'
};

/* eslint-disable-next-line */
const ActionButton = <T extends {}>(props: ActionButtonProps<T>) => {
  const onClickHandler = (): void => props.onClick(props.nft);

  return (
    <Button
      onClick={onClickHandler}
      disabled={props.disabled}
      description={props.title}
      type={props.type}
    />
  );
};

export default ActionButton;
