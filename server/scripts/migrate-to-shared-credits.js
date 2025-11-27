/**
 * Migration Script: Legacy Election Credits → Shared Credit System
 * 
 * This script migrates existing users from the old package-per-election system
 * to the new shared credit pool system.
 * 
 * What it does:
 * 1. Finds all users with legacy electionCredits
 * 2. Converts unused packages to shared credits or unlimited packages
 * 3. Preserves used packages for historical records
 * 4. Creates credit history entries
 * 
 * SAFE TO RUN MULTIPLE TIMES - Checks for existing migrations
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');

async function migrateToSharedCredits() {
    try {
        console.log('🔄 Starting Migration: Legacy Credits → Shared Credit System\n');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all users with legacy election credits
        const usersWithLegacyCredits = await User.find({
            'electionCredits.0': { $exists: true }
        });

        console.log(`📊 Found ${usersWithLegacyCredits.length} users with legacy credits\n`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const user of usersWithLegacyCredits) {
            try {
                console.log(`\n👤 Processing user: ${user.username} (${user.email})`);
                console.log(`   Legacy packages: ${user.electionCredits.length}`);

                let creditsAdded = 0;
                let unlimitedAdded = 0;
                let alreadyMigrated = false;

                // Check if already migrated (has credit history from migration)
                const hasMigrationHistory = user.creditHistory?.some(
                    h => h.transactionId && h.transactionId.startsWith('MIGRATION_')
                );

                if (hasMigrationHistory) {
                    console.log('   ⏭️  Already migrated, skipping...');
                    skippedCount++;
                    continue;
                }

                // Process each unused legacy credit
                for (const credit of user.electionCredits) {
                    if (!credit.used) {
                        const migrationTxnId = `MIGRATION_${credit._id}_${Date.now()}`;

                        if (credit.voterLimit === -1) {
                            // Convert to unlimited package
                            user.addUnlimitedPackage({
                                transactionId: migrationTxnId,
                                price: credit.price || 0,
                                plan: credit.plan
                            });
                            unlimitedAdded++;
                            console.log(`   ✅ Converted ${credit.plan} to unlimited package`);
                        } else {
                            // Convert to shared credits
                            user.addCredits(credit.voterLimit, {
                                transactionId: migrationTxnId,
                                price: credit.price || 0,
                                plan: credit.plan
                            });
                            creditsAdded += credit.voterLimit;
                            console.log(`   ✅ Converted ${credit.plan} to ${credit.voterLimit} shared credits`);
                        }
                    } else {
                        console.log(`   ⏭️  Skipped used package: ${credit.plan} (linked to election)`);
                    }
                }

                // Save user if any changes were made
                if (creditsAdded > 0 || unlimitedAdded > 0) {
                    await user.save();
                    console.log(`   💾 Saved: +${creditsAdded} credits, +${unlimitedAdded} unlimited packages`);
                    migratedCount++;
                } else {
                    console.log(`   ℹ️  No unused packages to migrate`);
                    skippedCount++;
                }

            } catch (error) {
                console.error(`   ❌ Error migrating user ${user.username}:`, error.message);
                errorCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successfully migrated: ${migratedCount} users`);
        console.log(`⏭️  Skipped (already migrated): ${skippedCount} users`);
        console.log(`❌ Errors: ${errorCount} users`);
        console.log('='.repeat(60));

        if (migratedCount > 0) {
            console.log('\n🎉 Migration completed successfully!');
            console.log('\nℹ️  Note: Legacy electionCredits are preserved for historical records.');
            console.log('   Used packages remain linked to their elections.');
        } else {
            console.log('\nℹ️  No users needed migration.');
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Confirmation prompt
console.log('⚠️  MIGRATION SCRIPT: Legacy Credits → Shared Credit System');
console.log('This script will convert unused legacy packages to the new system.');
console.log('It is SAFE to run multiple times.\n');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Do you want to proceed? (yes/no): ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        migrateToSharedCredits();
    } else {
        console.log('Migration cancelled.');
        process.exit(0);
    }
});
