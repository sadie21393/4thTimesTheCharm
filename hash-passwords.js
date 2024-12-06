const bcrypt = require("bcrypt");
const knex = require("knex")({
    client: "pg",
    connection: {
        host: "awseb-e-5j2pty6ugk-stack-awsebrdsdatabase-ugj0awcn4jwr.cj6qkuuke3n0.us-east-1.rds.amazonaws.com",
        user: "user123",
        password: "password123",
        database: "ebdb",
        port: 5432,
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    pool: { min: 0, max: 7 },
});

(async function hashPasswords() {
    try {
        // Fetch all users from the 'users' table
        const users = await knex("users").select("user_name", "password");

        for (const user of users) {
            const { user_name, password } = user;

            // Skip if the password is null or already hashed
            if (!password || password.length > 50) {
                console.log(
                    `Skipping ${user_name}: ${
                        !password ? "password is null" : "already hashed"
                    }`
                );
                continue;
            }

            // Hash the plaintext password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the password in the database
            await knex("users")
                .where({ user_name })
                .update({ password: hashedPassword });

            console.log(`Password hashed for user: ${user_name}`);
        }

        console.log("All passwords have been hashed successfully.");
    } catch (error) {
        console.error("Error hashing passwords:", error);
    } finally {
        // Close the database connection
        knex.destroy();
    }
})();
