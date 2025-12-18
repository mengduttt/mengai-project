// Script to demote ALL users to USER except specific admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoles(adminUsername) {
    try {
        // 1. Set ALL users to USER first
        await prisma.user.updateMany({
            data: { role: 'USER' }
        });
        
        console.log('✅ Step 1: All users set to USER role');
        
        // 2. Promote only the specified admin
        const admin = await prisma.user.update({
            where: { username: adminUsername },
            data: { role: 'ADMIN' }
        });
        
        console.log(`✅ Step 2: Promoted '${adminUsername}' to ADMIN`);
        
        // 3. Show all users now
        const users = await prisma.user.findMany({
            select: { username: true, role: true }
        });
        
        console.log('\n📊 Updated User Roles:');
        users.forEach(u => {
            console.log(`- ${u.username}: ${u.role}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Get admin username from command line
const adminUsername = process.argv[2];

if (!adminUsername) {
    console.log('Usage: node fixRoles.js <admin_username>');
    console.log('Example: node fixRoles.js adminmengg');
    process.exit(1);
}

fixRoles(adminUsername);
