import { ethers } from "hardhat"
import { setBalance } from "@nomicfoundation/hardhat-network-helpers"
import {
  impersonateAccount,
  stopImpersonatingAccount,
} from "@nomicfoundation/hardhat-network-helpers"
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  ContractTransaction,
  Overrides,
  Signer,
  utils as ethersHelpers,
} from "ethers"

/*********************************
 *      External Functions       *
 *********************************/

export const impersonate = impersonateAccount
export const stopImpersonate = stopImpersonatingAccount

export async function dealETH(target: Addressable, amount: BigNumberish) {
  await setBalance(await getAddress(target), BigNumber.from(amount))
}

export async function dealToken(
  target: Addressable,
  token: Addressable,
  amount: BigNumberish
) {
  const slot = await probeBalanceStorageSlot(await getAddress(token))
  const index = getStorageMapIndex(await getAddress(target), slot)
  await setStorageAt(await getAddress(token), index, BigNumber.from(amount))
}

export interface WalletContract extends BaseContract {
  connect(signer: Signer): this
  approve(
    spender: string,
    tokenAddr: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>
}

export async function dealTokenAndApprove(
  target: Signer,
  spender: Addressable,
  token: Addressable,
  amount: BigNumberish,
  options: {
    walletContract?: WalletContract
  } = {}
) {
  const targetAddr = await getAddress(options.walletContract ?? target)
  await dealToken(targetAddr, token, amount)
  if (options.walletContract) {
    await options.walletContract
      .connect(target)
      .approve(await getAddress(spender), await getAddress(token), amount)
    return
  }
  const tokenContract = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    await getAddress(token)
  )
  await tokenContract.connect(target).approve(await getAddress(spender), amount)
}

/*********************************
 *      Internal Functions       *
 *********************************/

// probeBalanceStorageSlot() is a function that is used to determine which storage slot in an Ethereum contract is being used to store the balance of an Ethereum account.
// It does this by iterating through a range of potential storage slots, and for each slot, it checks if the storage at that slot is related to the balance of an account.
// It does this by setting the storage value to a new value, then checking if the balance of the account has changed accordingly.
// If the balance has changed, it indicates that the storage slot being tested is the one used to store the balance, and the function returns the storage slot number.
// If no storage slot is found that is related to the balance of an account, the function throws an error.
async function probeBalanceStorageSlot(token: Addressable): Promise<number> {
  const account = ethers.constants.AddressZero
  const tokenAddress = await getAddress(token)
  const tokenContract = await ethers.getContractAt(
    "contracts/interfaces/IERC20.sol:IERC20",
    tokenAddress
  )
  for (let i = 0; i <= 100; i++) {
    const index = getStorageMapIndex(account, i)
    // Ensure this storage stores number
    const v = await getStorageAt(tokenAddress, index)
    let b: BigNumber
    try {
      b = BigNumber.from(v)
    } catch (e) {
      continue
    }
    // Probe to check if this storage is related to balance
    const p = b.add(1)
    await setStorageAt(tokenAddress, index, p)
    const pb = await tokenContract.balanceOf(account)
    await setStorageAt(tokenAddress, index, b)
    if (pb.eq(p)) {
      return i
    }
  }
  throw new Error(`Cannot find balance storage slot for token ${tokenAddress}`)
}

function getStorageMapIndex(key: string, slot: number): string {
  return ethers.utils.solidityKeccak256(["uint256", "uint256"], [key, slot])
}

function getStorageAt(address: string, index: string) {
  return ethers.provider.send("eth_getStorageAt", [address, index])
}

// setStorageAt() is a helper function that is used to set the value of a specific storage slot in an Ethereum contract.
// It takes as input the address of the Ethereum contract, the index of the storage slot to set, and the new value to set the storage slot to.
// It then sends an Ethereum JSON-RPC request to set the value of the storage slot.
// This function is typically used in conjunction with other functions that need to modify the storage of an Ethereum contract.
async function setStorageAt(
  address: string,
  index: string,
  value: BytesConvertible
) {
  await ethers.provider.send("hardhat_setStorageAt", [
    address,
    // index here must be a QUANTITY value, which is a hex string without leading zeros
    // (0xabc instead of 0x0abc)
    ethers.utils.hexValue(index),
    toBytes32(BigNumber.from(value)),
  ])
}

// Internal function: getAddress()
interface GetAddressFunc {
  getAddress(): Promise<string>
}
interface GetAddressProp {
  address: string
}
type Addressable = GetAddressFunc | GetAddressProp | string
function getAddress(target: Addressable): Promise<string> {
  if (typeof target === "string") {
    return Promise.resolve(target)
  }
  if ("address" in target) {
    return Promise.resolve(target.address)
  }
  return target.getAddress()
}

// Internal function: toBytes32()
type BytesConvertible = number | ethersHelpers.BytesLike | ethersHelpers.Hexable
function toBytes32(value: BytesConvertible): string {
  return ethersHelpers.hexlify(
    ethersHelpers.zeroPad(ethersHelpers.arrayify(value), 32)
  )
}
