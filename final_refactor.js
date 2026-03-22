const fs = require('fs');

const configs = [
    {
        file: 'c:/Users/gupta/Desktop/Vicinity/app/login/page.js',
        authNavProps: 'linkTo="/signup" linkText="Sign Up" homeText="Back Home"'
    },
    {
        file: 'c:/Users/gupta/Desktop/Vicinity/app/forgot-password/page.js',
        authNavProps: 'linkTo="/login" linkText="Log In" homeText="Back Home"'
    }
];

configs.forEach(({ file, authNavProps }) => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove GridBackground
    content = content.replace(/\/\/ --- (ADAPTIVE )?GRID BACKGROUND.*?---\nconst GridBackground = \(\) => \([\s\S]*?<\/div>\n\)\n\n/g, '');
    content = content.replace(/\/\/ --- GRID BACKGROUND \(THEME AWARE\) ---\nconst GridBackground = \(\) => \([\s\S]*?<\/div>\n\)\n\n/g, '');

    // 2. Remove VicinityLogo
    content = content.replace(/\/\/ --- VICINITY LOGO \(THEMED\) ---\nconst VicinityLogo = \(\{.*?\}\) => \([\s\S]*?<\/div>\n\)\n\n/g, '');
    content = content.replace(/\/\/ --- VICINITY LOGO \(THEMED\) ---\n\n/g, '');

    // 3. Remove Navbar
    content = content.replace(/\/\/ --- NAVBAR \(LOCAL & THEMED\) ---\nconst Navbar = \(\) => \([\s\S]*?<\/motion\.nav>\n\)\n\n/g, '');

    content = content.replace(/<Navbar \/>/g, `<AuthNavbar ${authNavProps} />`);

    // 4. Add Imports if missing
    const importsToAdd = [];
    if (!content.includes("import GridBackground")) importsToAdd.push("import GridBackground from '../../components/GridBackground'");
    if (!content.includes("import AuthNavbar")) importsToAdd.push("import AuthNavbar from '../../components/AuthNavbar'");

    const lastImportIndex = content.lastIndexOf('\nimport ');
    if (lastImportIndex !== -1 && importsToAdd.length > 0) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex + 1);
        const newImports = '\n' + importsToAdd.join('\n') + '\n';
        content = content.slice(0, endOfLastImport) + newImports + content.slice(endOfLastImport);
    }

    // Ensure VicinityLogo is no longer imported if it's not used (AuthNavbar handles it now)
    // Actually forgot-password uses `<VicinityLogo />` ? No, only Navbar had it. Let's check.
    if (!content.includes('<VicinityLogo')) {
        content = content.replace(/import VicinityLogo from '..\/..\/components\/VicinityLogo'\n/g, '');
    }

    fs.writeFileSync(file, content);
    console.log(`Successfully refactored ${file}`);
});
