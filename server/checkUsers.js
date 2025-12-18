// Script to check all users and their roles
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                email: true
            }
        });
        
        console.log('\n📊 All Users in Database:\n');
        console.log('ID | Username | Role | Email');
        console.log('---|----------|------|------');
        users.forEach(user => {
            console.log(`${user.id} | ${user.username} | ${user.role} | ${user.email}`);
        });
        console.log('\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllUsers();
