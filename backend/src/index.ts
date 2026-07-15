import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    message: 'StellarBridge API is running',
    version: '1.0.0',
    network: 'Stellar Testnet'
  });
});

// ─── USERS ────────────────────────────────────────────────────────────────

// Get or create a user by wallet address
app.post('/api/users/connect', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { wallets: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          wallets: {
            create: { address: walletAddress }
          }
        },
        include: { wallets: true }
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:walletAddress', async (req: Request, res: Response) => {
  try {
    const walletAddress = req.params.walletAddress as string;
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { wallets: true, transactionsAsSender: { take: 20, orderBy: { createdAt: 'desc' } } }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── TRANSACTIONS ────────────────────────────────────────────────────────

app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const { senderWallet, receiverWallet, assetCode, amount, type, hash } = req.body;

    const sender = await prisma.user.findUnique({ where: { walletAddress: senderWallet } });
    const receiver = await prisma.user.findUnique({ where: { walletAddress: receiverWallet } });

    const tx = await prisma.transaction.create({
      data: {
        hash,
        senderId: sender?.id,
        receiverId: receiver?.id,
        assetCode,
        amount: parseFloat(amount),
        type,
        status: 'SUCCESS'
      }
    });

    res.status(201).json(tx);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/transactions/:walletAddress', async (req: Request, res: Response) => {
  try {
    const walletAddress = req.params.walletAddress as string;
    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── MERCHANTS ────────────────────────────────────────────────────────────

app.post('/api/merchants', async (req: Request, res: Response) => {
  try {
    const { walletAddress, name, description } = req.body;
    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const merchant = await prisma.merchant.create({
      data: { ownerId: user.id, name, description }
    });

    res.status(201).json(merchant);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/merchants', async (req: Request, res: Response) => {
  try {
    const merchants = await prisma.merchant.findMany({
      include: { products: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ESCROWS ────────────────────────────────────────────────────────────

app.post('/api/escrows', async (req: Request, res: Response) => {
  try {
    const { escrowId, clientWallet, freelancerWallet, amount, assetCode } = req.body;
    
    const client = await prisma.user.findUnique({ where: { walletAddress: clientWallet } });
    const freelancer = await prisma.user.findUnique({ where: { walletAddress: freelancerWallet } });
    if (!client || !freelancer) return res.status(404).json({ error: 'User(s) not found' });

    const escrow = await prisma.escrow.create({
      data: {
        escrowId,
        clientId: client.id,
        freelancerId: freelancer.id,
        amount: parseFloat(amount),
        assetCode,
        status: 'CREATED'
      }
    });

    res.status(201).json(escrow);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/escrows/:escrowId/status', async (req: Request, res: Response) => {
  try {
    const escrowId = req.params.escrowId as string;
    const { status } = req.body;

    const validStatuses = ['FUNDED', 'APPROVED', 'RELEASED', 'REFUNDED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const escrow = await prisma.escrow.update({
      where: { escrowId },
      data: { status }
    });

    res.json(escrow);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── INVOICES ────────────────────────────────────────────────────────────

app.post('/api/invoices', async (req: Request, res: Response) => {
  try {
    const { merchantId, amount, assetCode, dueDate } = req.body;
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        merchantId,
        amount: parseFloat(amount),
        assetCode,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 StellarBridge API server running on port ${port}`);
  console.log(`   Network: Stellar Testnet`);
  console.log(`   Docs: http://localhost:${port}/`);
});
