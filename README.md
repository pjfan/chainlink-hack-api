# chainlink-hack-api

API created for Chainlink Hackathon Spring 2022.

Ported functionality from our React app to a backend API for integration with Chainlink Adapter.

Built using Express, Node, Typescript, and Moralis SDK.

## Getting Started
Add your Moralis serverURL and appID to the .env file.

```bash
vim .env
```

Install the dependencies:

```bash
yarn
```

After installing the dependencies, run the development server:

```bash
yarn dev
```

To compile the Typescript into Javascript:

```bash
yarn build
```

To run the production server (using compiled Javascript):

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

