import { getUncachableGitHubClient } from './github-client';
import { execSync } from 'child_process';

async function pushToGitHub() {
  try {
    console.log('🚀 Setting up GitHub repository...\n');

    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login}`);

    // Repository details
    const repoName = 'emergency-pos-scanner';
    const repoDescription = 'Free web-based emergency POS scanner with camera barcode scanning and offline payment processing';

    // Check if repository exists
    let repoExists = false;
    try {
      await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      repoExists = true;
      console.log(`✅ Repository '${repoName}' already exists`);
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`📦 Creating new repository '${repoName}'...`);
        
        // Create repository
        await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: repoDescription,
          private: false,
          auto_init: false,
        });
        
        console.log(`✅ Repository created successfully!`);
      } else {
        throw error;
      }
    }

    const remoteUrl = `https://github.com/${user.login}/${repoName}.git`;

    // Git commands
    console.log('\n📝 Preparing files for commit...');
    
    try {
      execSync('git init', { stdio: 'inherit' });
    } catch (e) {
      console.log('Git already initialized');
    }

    // Add remote
    try {
      execSync(`git remote add origin ${remoteUrl}`, { stdio: 'pipe' });
    } catch (e) {
      console.log('Remote already exists, updating...');
      execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'inherit' });
    }

    // Stage all files
    execSync('git add -A', { stdio: 'inherit' });

    // Check if there are changes to commit
    let hasChanges = false;
    try {
      execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
    } catch (e) {
      hasChanges = true;
    }

    // Commit if there are changes
    const commitMessage = process.argv[2] || 'Deploy Emergency POS Scanner';
    if (hasChanges) {
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      console.log('✅ Changes committed');
    } else {
      console.log('ℹ️  No changes to commit, using existing commits');
    }

    // Push to GitHub
    console.log('\n🚀 Pushing to GitHub...');
    execSync('git push -u origin main --force', { stdio: 'inherit' });

    console.log('\n✅ Successfully pushed to GitHub!');
    console.log(`\n🔗 Repository URL: https://github.com/${user.login}/${repoName}`);
    console.log('\n📋 Next steps for Netlify:');
    console.log('1. Go to https://app.netlify.com/');
    console.log('2. Click "Add new site" → "Import an existing project"');
    console.log(`3. Connect to GitHub and select "${repoName}"`);
    console.log('4. Build settings:');
    console.log('   - Build command: npm run build');
    console.log('   - Publish directory: dist');
    console.log('5. Click "Deploy site"');
    console.log('\n🎉 Your POS scanner will be live on Netlify!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

pushToGitHub();
