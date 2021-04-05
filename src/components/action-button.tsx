import React from "react";
import { Nft } from "../contexts/graph/classes";

type ActionButtonProps<T> = {
  nft: T;
  title: string;
  onClick: (nft: T) => void;
};

class ActionButton<T extends Nft> extends React.Component<
  ActionButtonProps<T>
> {
  onClickHandler = (): void => this.props.onClick(this.props.nft);

  render(): JSX.Element {
    const { title } = this.props;
    return (
      <div className="nft__control">
        <button className="nft__button" onClick={this.onClickHandler}>
          {title}
        </button>
      </div>
    );
  }
}

export default ActionButton;
