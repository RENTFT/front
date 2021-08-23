import React from "react";
import { SnackAlert } from "./common/snack-alert";
import { Toggle } from "./common/toggle";

type PageLayoutProps = {
  onSwitch?: () => void;
  title?: string;
  toggleValue?: boolean;
};

const PageLayout: React.FC<PageLayoutProps> = ({
  onSwitch,
  toggleValue,
  title,
  children,
}) => {
  return (
    <div className="flex flex-col py-4 w-full">
      <div className="flex-auto justify-self-end w-full justify-end">
        {title && (
          <Toggle title={title} toggleValue={toggleValue} onSwitch={onSwitch} />
        )}
        {!title && <div style={{ height: "4em" }} />}
      </div>
      {children}
      <div className="flex-1">
        <SnackAlert></SnackAlert>
      </div>
    </div>
  );
};

export default PageLayout;
