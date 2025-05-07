import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test client
  const client = await prisma.client.create({
    data: {
      name: 'Test Client',
    },
  });

  console.log('Created client:', client);

  // Create agency user
  const agencyUser = await prisma.user.create({
    data: {
      name: 'Agency User',
      email: 'agency@leadgeneration.io',
      role: Role.AGENCY,
    },
  });

  console.log('Created agency user:', agencyUser);

  // Create client user linked to the test client
  const clientUser = await prisma.user.create({
    data: {
      name: 'Client User',
      email: 'client@example.com',
      role: Role.CLIENT,
      clientId: client.id,
    },
  });

  console.log('Created client user:', clientUser);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 