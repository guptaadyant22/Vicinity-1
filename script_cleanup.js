const fs = require('fs');

function processFile(file, isProfile) {
    let content = fs.readFileSync(file, 'utf8');

    // Match the block from // --- NAVBAR (LOCAL & THEMED) --- to the end of the <motion.nav> block
    // This uses a robust regex
    const navbarMatch = content.match(/\/\/ --- (OFFICIAL )?NAVBAR.*?\nconst Navbar = \(\) => [\s\S]*?<\/motion\.nav>\n(  \)\n\}|\))/);

    if (navbarMatch) {
        content = content.replace(navbarMatch[0], '');
        console.log(`Replaced unused local navbar in ${file}`);
    } else {
        // If not found, let's look for just the function definition and remove it.
        const fallbackMatch = content.match(/const Navbar = \(\) => [\s\S]*?<\/motion\.nav>\n(  \)\n\}|\))/);
        if (fallbackMatch) {
            content = content.replace(fallbackMatch[0], '');
            console.log(`Replaced (fallback) unused local navbar in ${file}`);
        }
    }

    if (isProfile) {
        // Replace <Navbar /> with <ProfileNavbar />
        content = content.replace('<Navbar />', '<ProfileNavbar />');

        // Add import statement for ProfileNavbar
        if (!content.includes('import ProfileNavbar')) {
            const authImportIndex = content.lastIndexOf("import VicinityLogo from '../../../components/VicinityLogo'");
            if (authImportIndex !== -1) {
                const importBlock = "import VicinityLogo from '../../../components/VicinityLogo'\nimport ProfileNavbar from '../../../components/ProfileNavbar'\n";
                content = content.replace("import VicinityLogo from '../../../components/VicinityLogo'", importBlock);
            }
        }
    }

    // Update original file
    fs.writeFileSync(file, content);
}

processFile('c:/Users/gupta/Desktop/Vicinity/app/login/page.js', false);
processFile('c:/Users/gupta/Desktop/Vicinity/app/forgot-password/page.js', false);
processFile('c:/Users/gupta/Desktop/Vicinity/app/user/profile/page.js', true);

console.log('Cleanup finished.');
