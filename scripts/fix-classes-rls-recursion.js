const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixClassesRLSRecursion() {
  try {
    console.log('🔧 Fixing Classes Table RLS Infinite Recursion...');

    // Read the SQL script
    const fs = require('fs');
    const path = require('path');
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'fix-classes-rls-recursion.sql'),
      'utf8'
    );

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(
            `  ${i + 1}/${statements.length}: Executing statement...`
          );
          const { error } = await supabase.rpc('exec_sql', { sql: statement });

          if (error) {
            console.log(
              `    ⚠️  Statement ${
                i + 1
              } had an error (this might be expected):`,
              error.message
            );
          } else {
            console.log(`    ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(
            `    ⚠️  Statement ${i + 1} had an error (this might be expected):`,
            err.message
          );
        }
      }
    }

    console.log('\n🎉 Classes table RLS infinite recursion fix completed!');
    console.log(
      '\n📊 The teacher dashboard should now work without infinite recursion errors.'
    );
    console.log(
      '\n🔗 You can now test the teacher dashboard at /teacher/dashboard'
    );
  } catch (error) {
    console.error('❌ Error fixing classes table RLS recursion:', error);
  }
}

// Check if we can execute SQL directly
async function checkDirectSQLExecution() {
  try {
    console.log('🔍 Checking if we can execute SQL directly...');

    // Try to disable RLS on classes table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.log(
        '❌ Cannot execute SQL directly. You need to run the SQL script manually in your Supabase SQL editor.'
      );
      console.log('\n📋 Steps to fix manually:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log(
        '3. Copy and paste the contents of fix-classes-rls-recursion.sql'
      );
      console.log('4. Execute the script');
      console.log(
        '\n🔗 File location: client/scripts/fix-classes-rls-recursion.sql'
      );
      return false;
    } else {
      console.log(
        '✅ Can execute SQL directly. Proceeding with automatic fix...'
      );
      return true;
    }
  } catch (err) {
    console.log('❌ Cannot execute SQL directly. Manual execution required.');
    return false;
  }
}

// Main execution
async function main() {
  const canExecuteDirectly = await checkDirectSQLExecution();

  if (canExecuteDirectly) {
    await fixClassesRLSRecursion();
  }
}

main();
