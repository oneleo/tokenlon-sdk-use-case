# Sample Tokenlon SDK Project

- This project demonstrates a basic Tokenlon SDK use case.
- Try running some of the following tasks:

## Compile

- Compile contracts

```shell
yarn install
npx hardhat compile --show-stack-traces --force
```

## Excute sample for Mainnet

1. Edit the .env file for Mainnet

```shell
cp .env_example_mainnet .env
code .env
```

2. Excute the Tokenlon SDK example for Mainnet

```shell
npx hardhat run scripts/ammwrapper_eoa_via_sdk.ts
npx hardhat run scripts/ammwrapperwithpath_eoa_via_sdk.ts
npx hardhat run scripts/rfq_eoa_via_sdk.ts
```

## Excute sample for Arbitrum

1. Edit the .env file for Arbitrum

```shell
cp .env_example_arbitrum .env
code .env
```

2. Excute the Tokenlon SDK example for Mainnet

```shell
npx hardhat run scripts/limitorder_eoa_via_sdk.ts
```

## Information

- The Tokenlon SDK repo: [https://github.com/consenlabs/tokenlon-contracts-lib-js](https://github.com/consenlabs/tokenlon-contracts-lib-js)
