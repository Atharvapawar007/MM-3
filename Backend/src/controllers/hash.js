// hashPassword.js
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter plaintext password to hash: ', async (password) => {
    try {
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);
        console.log('\n🔐 Hashed Password:\n', hashed);
    } catch (err) {
        console.error('❌ Error hashing password:', err);
    } finally {
        rl.close();
    }
});
