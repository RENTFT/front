import React, { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import MenuIcon from "@heroicons/react/outline/MenuIcon";
import XIcon from "@heroicons/react/outline/XIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { Footer } from "./footer";
import { WalletConnect } from "./wallet-connect";
import { classNames } from "../../../utils";

const navigation = [
  { name: "Rent", href: "/" },
  { name: "Lend", href: "/lend" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Faq", href: "/faq" }
];
const userNavigation = [
  { name: "Profile", href: "/profile" },
  { name: "Sign out", href: "/signout", disabled: true }
];


const isPathActive = (linkPath: string, pathname: string) => {
  if (pathname === linkPath) return true;
  if (pathname.startsWith(linkPath) && linkPath !== "/") return true;
  if (pathname.startsWith("/rent") && linkPath === "/") return true;
  if (pathname === "/user-is-renting" && linkPath === "/") return true;
  if (pathname === "/user-is-lending" && linkPath === "/lend") return true;
  return false;
};

export const AppLayout: React.FC = ({ children }) => {
  const { pathname } = useRouter();

  return (
    <div>
      <Disclosure as="header">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 lg:mt-8">
              <div className="relative h-16 lg:h-20 flex justify-between">
                <div className="relative z-10 flex lg:px-0">
                  <div className="flex-shrink-0 flex items-center pb-2">
                    <img
                      className="block h-8 lg:h-10 w-auto"
                      src="/assets/logo.svg"
                      alt="reNFT"
                    />
                  </div>
                </div>
                <nav
                  className="hidden flex-initial items-center justify-center flex-grow-0 lg:flex lg:space-x-4"
                  aria-label="Global"
                >
                  {navigation.map((item) => (
                    <Link href={item.href} key={item.name}>
                      <a
                        className="relative outline-none block p-1"
                        aria-current={
                          isPathActive(item.href, pathname) ? "page" : undefined
                        }
                      >
                        <div
                          className={classNames(
                            "relative py-1  leading-5 font-display uppercase text-sm whitespace-nowrap ",
                            isPathActive(item.href, pathname)
                              ? "text-black border-b-4 border-rn-orange"
                              : "text-gray-400 border-b-4 border-white hover:border-rn-orange hover:text-black"
                          )}
                        >
                          {item.name}
                        </div>
                      </a>
                    </Link>
                  ))}
                </nav>

                <div className="relative z-10 flex  items-center lg:hidden mr-2">
                  {/* Mobile menu button */}
                  <Disclosure.Button
                    className="border-2 border-black p-2 shadow-rn-one
                  inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <span className="sr-only">Open menu</span>
                    {open ? (
                      <XIcon className="block h-4 w-4" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-4 w-4" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>

                <div className="hidden lg:relative lg:z-10 lg:ml-4 lg:flex flex-shrink-0 lg:items-center lg:w-64 lg:justify-self-end lg:justify-end">
                  {/* Profile dropdown */}
                  <Menu as="div" className="flex-shrink-0 relative ml-4">
                    <WalletConnect menuButton />
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute z-20 mt-4 border-2 border-black w-full bg-white shadow-rn-one max-h-60 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-md">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link href={item.href}>
                                <a
                                  className={classNames(
                                    item.disabled
                                      ? "text-gray-400 cursor-not-allowed"
                                      : active
                                        ? "text-white bg-black"
                                        : "text-black hover:bg-black hover:text-white",
                                    "cursor-default select-none relative block p-2"
                                  )}
                                >
                                  {item.name}
                                </a>
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="lg:hidden flex justify-end md:justify-none items-center">
                <div className="flex-shrink-0">
                  <WalletConnect />
                </div>
              </div>
            </div>
            {/* Mobile menu */}
            <Disclosure.Panel
              as="nav"
              className="lg:hidden shadow-rn-one mx-4 mb-4 border-2  border-black"
              aria-label="Global"
            >
              <div className=" space-y-1">
                {navigation.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <a
                      className={classNames(
                        isPathActive(item.href, pathname)
                          ? "bg-black text-white"
                          : "hover:bg-black hover:text-white",
                        "block py-2 px-3 text-base font-medium"
                      )}
                      aria-current={
                        isPathActive(item.href, pathname) ? "page" : undefined
                      }
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
              <div className="border-t-2 border-gray-700 pb-3 flex justify-end flex-col">
                <div className="mt-3 space-y-1 justify-end">
                  {userNavigation.map((item) => (
                    <Link href={item.href} key={item.name}>
                      <a className="block py-2 px-3 text-base font-medium hover:bg-black hover:text-white">
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main>
        <div className="max-w-7xl mx-auto flex text-sm font-body leading-tight min-h-full w-full overflow-y-hidden pb-6 relative">
          <div
            className="flex-1 flex flex-col min-h-full items-center  border-4 border-black mx-6 shadow-rn-one"
            style={{
              backgroundImage:
                "linear-gradient(rgb(244, 62, 119) 0%, rgb(104, 87, 159) 100%)"
            }}
          >
            <div className="flex mb-8 w-full ">{children}</div>
          </div>
        </div>
      </main>
      <div id="pagination"></div>
      <Footer />
    </div>
  );
};