import {
  impersonateAccount,
  stopImpersonatingAccount,
} from "@nomicfoundation/hardhat-network-helpers"

/*********************************
 *      External Functions       *
 *********************************/

export const impersonate = impersonateAccount
export const stopImpersonate = stopImpersonatingAccount
