import React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import { SetupServerApi } from "msw/node";
import { rest } from "msw";
import * as testLendings from "./lendings.json";
import * as testAssets from "./assets.json";
import { PAGE_SIZE } from "renft-front/consts";
import { getUniqueID } from "renft-front/utils";
import { sleep } from "renft-front/utils";

jest.mock("zustand");
jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("renft-front/hooks/store/useSnackProvider");
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    useWallet: jest.fn(() => ({
      network: "mainnet",
      signer: "dummy signer",
      address: "dummy address",
    })),
  };
});

import Home from "renft-front/pages/index";
let OLD_ENV: NodeJS.ProcessEnv;

beforeAll(() => {
  jest.resetModules();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  OLD_ENV = { ...process.env };
  process.env.NEXT_PUBLIC_OPENSEA_API = "https://api.opensea";
  process.env.NEXT_PUBLIC_RENFT_API = "https://renftapi";
  process.env.NEXT_PUBLIC_EIP721_API = "https://eip721";
  process.env.NEXT_PUBLIC_EIP1155_API = "https://eip1155";
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = "mainnet";
});

afterAll(() => {
  process.env = OLD_ENV;
  console.error.mockRestore();
  console.log.mockRestore();
});

describe("User is lending when wallet connected ", () => {
  // Enable API mocking before tests.
  let mswServer: SetupServerApi;
  beforeAll(async () => {
    // use dynamic require to properly mock process.env
    await import("__mocks__/server").then(({ server }) => {
      mswServer = server;
      return mswServer.listen();
    });
  });

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => {
    if (mswServer) mswServer.resetHandlers();
    jest.clearAllMocks();
  });

  // Disable API mocking after the tests are done.
  afterAll(() => mswServer && mswServer.close());

  it("renders clickable lent items", async () => {
    //todo
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    mswServer.use(
      rest.options(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        return res(ctx.status(200));
      }),
      rest.post(`${process.env.NEXT_PUBLIC_RENFT_API}/*`, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json(testLendings));
      }),
      // empty opensea
      rest.get(
        `${process.env.NEXT_PUBLIC_OPENSEA_API}/*`,
        async (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(testAssets));
        }
      ),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );

    render(<Home />);

    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 1500,
    });

    // shows actual cards
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-action");

      expect(items.length).toBe(PAGE_SIZE);
      items.forEach((item) => {
        expect(item).toHaveAttribute("disabled");
      });
    });

    const lending = testLendings.data.lendings[3];
    const id = getUniqueID(lending.nftAddress, lending.tokenId);
    const re = new RegExp(`toggle catalogue item ${id}`, "i");

    const checkbox = screen.getByLabelText(re);
    user.click(checkbox);

    expect(checkbox).toBeEnabled();

    await sleep(1000);
    const items = screen.getAllByTestId("catalogue-item-action");
    items.forEach((item) => {
      if (item.id === `catalogue-button-${id}`) {
        expect(item).not.toHaveAttribute("disabled");
      } else {
        expect(item).toHaveAttribute("disabled");
      }
    });

    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  }, 6000);
  describe("claim", () => {
    it("rerenders saved form items, when form modal closes", () => {
      //todo
    });
    it("rerenders saved form items, when form model closes without removed item (someone already rented it out in the bg)", () => {
      //todo
    });
    it("rerenders selected rentals when page changed", () => {
      //todo
    });
  });
  describe("stop lend modal", () => {
    it("rerenders saved form items, when form modal closes", () => {
      //todo
    });
    it("rerenders saved form items, when form model closes without removed item (someone already rented it out in the bg)", () => {
      //todo
    });
    it("rerenders selected rentals when page changed", () => {
      //todo
    });
  });
  it("shows 3 states (lending-no-renter/lending-has-renter/lender-expired-claimable)", () => {});
  it("can claim item", () => {});
  it("can claim item", () => {});

  it("shows lended item in rental tab but owner cannot select it", () => {});
  describe("filter", () => {
    //todo
  });
  describe("sort", () => {
    //todo
  });
});