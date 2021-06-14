import React, { useCallback, useContext, useEffect, useState } from "react";
import Layout from "./layout";
import { TransactionNotifier } from "./transaction-notifier";
import GraphContext from "../contexts/graph";
import { short } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import {
  E721Context,
  E721BContext,
  E1155Context,
  E1155BContext,
  WETHContext,
  DAIContext,
  USDCContext,
  USDTContext,
  TUSDContext,
} from "../hardhat/SymfoniContext";
import createDebugger from "debug";
import Link from "next/link";
import { useRouter } from "next/router";

const debug = createDebugger("app:layout");
const ROUTES = [
  {
    path: "/rent",
    name: "Rent",
  },
  {
    path: "/lend",
    name: "Lend",
  },
  {
    path: "/dashboard",
    name: "My Dashboard",
  },
  // {
  //   path: "/favourites",
  //   name: "My Favourites",
  // },
  // {
  //   path: "/leaderboard",
  //   name: "Leaderboard",
  // },
  {
    path: "/faq",
    name: "FAQ",
  },
];

const AppLayout: React.FC = ({ children }) => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { userData } = useContext(GraphContext);
  const route = useRouter();
  const { instance: e721 } = useContext(E721Context);
  const { instance: e721b } = useContext(E721BContext);
  const { instance: e1155 } = useContext(E1155Context);
  const { instance: e1155b } = useContext(E1155BContext);
  const { instance: weth } = useContext(WETHContext);
  const { instance: dai } = useContext(DAIContext);
  const { instance: usdc } = useContext(USDCContext);
  const { instance: usdt } = useContext(USDTContext);
  const { instance: tusd } = useContext(TUSDContext);
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    if (userData?.name !== "") {
      setUsername(userData?.name);
    }
  }, [userData]);

  const mintE20 = useCallback(
    async (e20: number) => {
      switch (e20) {
        case 1:
          if (!weth) return;
          await (await weth.faucet()).wait();
          break;
        case 2:
          if (!dai) return;
          await (await dai.faucet()).wait();
          break;
        case 3:
          if (!usdc) return;
          await (await usdc.faucet()).wait();
          break;
        case 4:
          if (!usdt) return;
          await (await usdt.faucet()).wait();
          break;
        case 5:
          if (!tusd) return;
          await (await tusd.faucet()).wait();
          break;
      }
    },
    [dai, tusd, usdc, usdt, weth]
  );
  const mintNFT = useCallback(
    async (nft: number) => {
      switch (nft) {
        case 0:
          if (!e721) return;
          await (await e721.faucet()).wait();
          break;
        case 1:
          if (!e721b) return;
          await (await e721b.faucet()).wait();
          break;
        case 2:
          if (!e1155) return;
          await (await e1155.faucet(10)).wait();
          break;
        case 3:
          if (!e1155b) return;
          await (await e1155b.faucet(10)).wait();
          break;
        default:
          debug("unknown NFT");
          return;
      }
    },
    [e721, e721b, e1155, e1155b]
  );

  return (
    <Layout>
      <div className="content-wrapper mb-l">
        <div className="header">
          <div className="header__logo"></div>
          <div className="header__user">
            <Link href="/profile">{username || short(currentAddress)}</Link>
          </div>
        </div>
      </div>
      <div className="content-wrapper mb-l">
        <div className="menu">
          {ROUTES.map((r) => {
            const isActive = route.route.startsWith(r.path);
            return (
              <Link key={r.path} href={r.path}>
                <a className={`menu__item ${isActive ? "menu__item-active" : ""}`}>
                  {r.name}
                </a>
              </Link>
            );
          })}
        </div>
        <button className="menu__item" onClick={() => mintNFT(0)}>
          Mint 721A
        </button>
        <button className="menu__item" onClick={() => mintNFT(1)}>
          Mint 721B
        </button>
        <button className="menu__item" onClick={() => mintNFT(2)}>
          Mint 1155A
        </button>
        <button className="menu__item" onClick={() => mintNFT(3)}>
          Mint 1155B
        </button>
        {/* payment token faucets */}
        <div>
          <button className="menu__item" onClick={() => mintE20(1)}>
            Mint WETH
          </button>
          <button className="menu__item" onClick={() => mintE20(2)}>
            Mint DAI
          </button>
          <button className="menu__item" onClick={() => mintE20(3)}>
            Mint USDC
          </button>
          <button className="menu__item" onClick={() => mintE20(4)}>
            Mint USDT
          </button>
          <button className="menu__item" onClick={() => mintE20(5)}>
            Mint TUSD
          </button>
          {/* <button className="menu__item" onClick={() => advanceTime(24 * 60 * 60 )}>
              Advance time
            </button> */}
        </div>
      </div>
      {/* CONTENT */}
      <div className="content-wrapper main-content mb-l">{children}</div>
      {/* FOOTER */}
      <div className="content-wrapper footer-content">
        <div className="copy">2021 ReNFT</div>
        <div className="copy">
          App version: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
        </div>
        <div className="soc">
          <a
            href="https://discord.gg/ka2u9n5sWs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="discord"></span>
          </a>
          <a
            href="https://twitter.com/renftlabs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="twitter"></span>
          </a>
        </div>
      </div>
      <TransactionNotifier />
    </Layout>
  );
};

export default AppLayout;
