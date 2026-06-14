const admin = require("firebase-admin");

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Auth Error");
    }
}

const db = admin.firestore();

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send("Only POST");

    try {
        const { domain } = req.query; 
        const { provider, type, amount, sender, trxId } = req.body;

        if (!domain || !trxId || !amount) return res.status(400).send("Missing Data");

        const paymentRef = db.collection('shops').doc(domain).collection('transactions').doc(trxId);

        await paymentRef.set({
            provider: provider || "Unknown",
            type: type || "Receive Money",
            amount: parseFloat(amount),
            sender: sender || "Unknown",
            trxId: trxId,
            status: "unused",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({ message: "Saved!" });
    } catch (error) {
        return res.status(500).send("Error");
    }
};
