import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Connecting to database...');
    const subscriberCount = await prisma.newsSubscriber.count();
    console.log('NewsSubscriber count:', subscriberCount);
    
    const subscribers = await prisma.newsSubscriber.findMany({
      take: 5
    });
    console.log('First 5 subscribers:', subscribers);
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 