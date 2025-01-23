const { ethers } = require('ethers');
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
app.use(express.json());
app.use(cors()); 

const suiPath = "/home/arceus26/sui/sui";
const packageId = "0xe622f5fe68cbac8ec2e189f806db66de736a398fbd177687a59d87ab5e84cd1f";
const treasuryCap = "0xe39414da283646b4d52cc8f02f559417df8108a60cf3b142f1493ab54d51d075"; 
const adminCap = "0x7c74cef2ad4306f99fe52c1a1b1ab90962bcb37632d3eb94a50689d4c2fa1781"; 

const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/6Z1B_9W12Yx2Z_EvEdJlhVgZqM9jkaKl");
const privateKey = "09ef81e81e4d4f42a2832e9840239ff9733d8d8d6ed275759b2f75baab0506aa";
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x9051847c9067750286Da75951aC63C9B305A9F37";
const contractABI = [
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public"
];

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const mintETH = async (recipientAddress, amount) => {
    if (!ethers.isAddress(recipientAddress)) {
        console.error("Adresa Ethereum este invalidă.");
        return;
    }

    const value = ethers.parseUnits(amount.toString(), 18); // Unitati wei

    try {
        console.log(`Trimit tranzacția de minting pentru: ${recipientAddress}`);
        const tx = await contract.mint(recipientAddress, value);
        console.log("Hash-ul tranzacției:", tx.hash);
        await tx.wait();
        console.log("Tokens minted successfully!");
    } catch (error) {
        console.error("Eroare la minting pe Ethereum:", error);
        throw error;
    }
};

const burnETH = async (amount) => {
    const value = ethers.parseUnits(amount.toString(), 18); // Unitati wei

    try {
        const tx = await contract.burn(value);
        console.log("Hash-ul tranzacției:", tx.hash);
        await tx.wait();
        console.log("Tokens burned successfully!");
    } catch (error) {
        console.error("Eroare la burn pe Ethereum:", error);
        throw error;
    }
};

const mintSUI = async (recipient, amount) => {
    const decimals = 9;
    const mintAmount = (amount * 10 ** decimals).toString();
    const command = `${suiPath} client call --package ${packageId} --module ananas --function mint --args ${treasuryCap} ${mintAmount} ${recipient} ${adminCap}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Eroare la execuția comenzii: ${stderr}`);
            return;
        }

        console.log(`Comandă executată cu succes: ${stdout}`);
    });
};

const burnSui = async (coin_id) => {
    const command = `${suiPath} client call --package ${packageId} --module ananas --function burn --args ${treasuryCap} ${coin_id} ${adminCap}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Eroare la execuția comenzii: ${stderr}`);
            return;
        }

        console.log(`Comandă executată cu succes: ${stdout}`);
    });
};

app.post('/Sui_to_Eth', async (req, res) => {
    const { coin_id, recipientAddress, amount } = req.body;

    try {
        await burnSui(coin_id);

        await mintETH(recipientAddress, amount);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/Eth_to_Sui', async (req, res) => {
    const { recipientAddress, fromAddress, amount } = req.body;

    try {
        await burnETH(amount);

        await mintSUI(recipientAddress, amount);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});
