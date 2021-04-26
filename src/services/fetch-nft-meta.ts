import { NftToken } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";
import { CORS_PROXY } from "../consts";

const IPFSGateway = "http://dweb.link/ipfs/";

/**
 * Matches IPFS CIDv0 (all start with Qm)
 * Matches IPFS CIDv1 (all start with b and use base32 case-insensitive encoding)
 * @param url
 * @returns
 */
const matchIPFS_URL = (url: string) => {
  const isIPFS_URL =
    url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44})(\/.+)?$/) ||
    url.match(/(b[1-7a-zA-Z]{58})(\/.+)?$/);
  return isIPFS_URL;
};

const matchWeirdBaseURL = (url: string) => {
  const isWeird = url.endsWith("0x{id}");
  return isWeird;
};

const removeWeirdBaseURLEnd = (url: string) => {
  const withoutEnd = url.slice(0, url.length - "0x{id}".length);
  return withoutEnd;
};

/**
 * ! There are issues with CORS policy. So Sandbox and a couple of others need to be
 * ! requested through a proxy
 * @param url check if it is sandbox. Sandbox does not set CORS headers, and so you need
 * to proxy the request, unfortunately.
 * @returns
 */
const isSandbox = (url: string) =>
  /^(https:\/\/api.sandbox.game\/lands)/.test(url);

const buildStaticIPFS_URL = (matched: string[]) => {
  const [, cid, path = ""] = matched;
  return `${IPFSGateway}${cid}${path}`;
};

/**
 *
 * @param IPFS_URL is an output from matchIPFS_URL function.
 * @returns
 */
const loadMetaFromIPFS = async (
  IPFS_URL: RegExpMatchArray | null
): Promise<NftToken["meta"]> => {
  if (!IPFS_URL) {
    console.warn("could not fetch meta IPFS URL");
    return {
      image: "",
      description: "",
      name: "",
    };
  }

  const staticIPFS_URL = buildStaticIPFS_URL(IPFS_URL);
  try {
    const response = await fetch(staticIPFS_URL);

    let data: any = {};
    try {
      data = await response.json();
    } catch (e) {
      // ! this happens with ZORA media for me
      console.warn("could not get json, which could mean this is media");
      return { image: staticIPFS_URL };
    }

    const imageIsIPFS_URL = matchIPFS_URL(data?.image);
    return {
      image: imageIsIPFS_URL
        ? buildStaticIPFS_URL(imageIsIPFS_URL)
        : data?.image,
      description: data?.description,
      name: data?.name,
    };
  } catch (err) {
    console.warn("issue loading meta from IPFS");
  }
};

export const fetchNFTMeta = async (nft: Nft): Promise<NftToken["meta"]> => {
  const { _mediaURI, _tokenURI } = nft;

  let tokenURI: string = _tokenURI;

  const isWeirdBaseURL = matchWeirdBaseURL(tokenURI);
  if (isWeirdBaseURL) {
    // ! this is opensea, in my tests. And even though this weird base url says you need hex
    // ! form int, you should in fact, pass an int number lol...
    tokenURI = removeWeirdBaseURLEnd(tokenURI) + nft.tokenId;
  }

  if (_mediaURI) {
    return { image: _mediaURI };
  }
  if (!tokenURI) return {};

  const isIPFS_URL = matchIPFS_URL(tokenURI);
  if (isIPFS_URL) return await loadMetaFromIPFS(isIPFS_URL);

  try {
    // ! people will tell us: my X NFT is not showing. We will check, and it
    // ! will probably because we aren't proxying the request for meta here
    const isProxyable = isSandbox(tokenURI);
    const fetchThis = isProxyable ? `${CORS_PROXY}${tokenURI}` : tokenURI;
    const response = await fetch(fetchThis);
    const data = await response?.json();

    if (!data?.image?.startsWith("ipfs://ipfs/")) {
      return {
        image: data?.image,
        description: data?.description,
        name: data?.name,
      };
    } else {
      console.warn(
        "is not IPFS URL, but we are downloading meta as if it is O_O"
      );
      return {};
    }
  } catch (err) {
    console.warn(err);
    return {};
  }
};
