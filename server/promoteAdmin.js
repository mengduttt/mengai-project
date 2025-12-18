// Script to promote user to ADMIN
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin(username) {
    try {
        const updatedUser = await prisma.user.update({
            where: { username: username },
            data: { role: 'ADMIN' }
        });
        
        console.log(`✅ User '${username}' berhasil dipromosikan ke ADMIN!`);
        console.log(`Role sekarang: ${updatedUser.role}`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Get username from command line argument
const username = process.argv[2];

if (!username) {
    console.log('Usage: node promoteAdmin.js <username>');
    console.log('Example: node promoteAdmin.js adminmengg');
    process.exit(1);
}

promoteToAdmin(username);
