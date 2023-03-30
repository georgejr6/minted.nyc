// Import necessary modules and define constants
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { Algod, Algodv2 } = require('algosdk');

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });
const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });

const mediaDir = path.join(__dirname, 'media');

// Define a function for converting latitude and longitude values to physical address
async function convertLocationToPhysicalAddress(latitude, longitude) {
  // Insert your Google Maps API key here
  const apiKey = 'YOUR_API_KEY_HERE';

  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);

  if (!response.ok) {
    throw new Error(`Failed to convert location to physical address: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Failed to convert location to physical address: ${data.error_message}`);
  }

  return data.results[0].formatted_address;
}

// Define the route handler for minting NFTs
app.post('/nft', upload.single('media'), async (req, res) => {
  try {
    const { media, location } = req.body;
    const mediaPath = req.file ? req.file.path : null;

    const physicalAddress = await convertLocationToPhysicalAddress(location.latitude, location.longitude);

    const metadata = {
      name: `NFT of ${physicalAddress}`,
      description: `NFT of a location in ${physicalAddress}`,
      image: '',
    };

    const algodToken = 'YOUR_ALGOD_TOKEN_HERE';
    const algodAddress = 'YOUR_ALGOD_ACCOUNT_ADDRESS_HERE';
    const algodServer = 'https://testnet-algorand.api.purestake.io/ps2';
    const algodPort = '';

    const algodClient = new Algodv2(algodToken, algodServer, algodPort);
    const accountInfo = await algodClient.accountInformation(algodAddress).do();

    const assetParams = {
      creator: algodAddress,
      name: `NFT of ${physicalAddress}`,
      unitName: 'NFT',
      total: 1,
      decimals: 0,
      defaultFrozen: false,
      url: '',
      metadataHash: '',
      manager: algodAddress,
      reserve: algodAddress,
      freeze: algodAddress,
      clawback: algodAddress,
    };

    const txn = await algodClient.makeAssetCreateTxnWithSuggestedParamsFromObject(assetParams, {
      suggestedParams: await algodClient.getTransactionParams().do(),
    });

    const signedTxn = txn.signTxn(accountInfo.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn.blob).do();

    metadata.image = `http://localhost:${port}/media/${txId}`;

    const mintNFT = async (metadata) => {
      const algodClient = new Algod(algodToken, algodServer, algodPort);
      const accountInfo = await algodClient.accountInformation(algodAddress);
    
      const nftAssetID = accountInfo.assets.find(
        (asset) => asset.params.name === `NFT of ${physicalAddress}`
      ).assetid;

      const note = algosdk.encodeObj({ metadata });
        const txn = {
          from: sender,
          to: sender,
          fee: feePerByte * (estimatedSize + note.length),
          amount: 0,
          firstRound: params.lastRound,
          lastRound: params.lastRound + 1000,
          genesisHash: params.genesisHash,
          genesisID: params.genesisID,
          note,
          lease: leaseTxn,
          type: 'appl',
          appIndex: nftAppId,
          appOnComplete: 4,
          appArgs: [algosdk.encodeUint64(amount), algosdk.encodeUint64(lat), algosdk.encodeUint64(lon), mediaTxId],
          accounts: [sender],
          foreignAssets: [mediaAssetId],
          assetAmounts: [1],
        };
        
        const signedTxn = algosdk.signTransaction(txn, Buffer.from(senderSk, 'base64'));
        
        const response = await fetch(`${algodAddress}/v2/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-binary',
            'X-Algo-API-Token': algodToken,
          },
          body: signedTxn.blob,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to mint NFT: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.txId) {
          console.log(`NFT minted successfully with transaction ID: ${data.txId}`);
          return data.txId;
        } else if (data['Application Not Found']) {
          console.log('NFT minting failed: NFT application not found');
          return null;
        } else {
          console.log(`NFT minting failed: ${JSON.stringify(data)}`);
          return null;
        }
        