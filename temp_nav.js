const fs = require('fs');

const files = [
    'c:/Users/gupta/Desktop/Vicinity/app/login/page.js',
    'c:/Users/gupta/Desktop/Vicinity/app/forgot-password/page.js',
    'c:/Users/gupta/Desktop/Vicinity/app/user/profile/page.js'
];

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');

        // Remove the Navbar definition safely
        const navbarRegex = /\n(\/\/ --- (OFFICIAL )?NAVBAR .*?---\n+)?const Navbar = \(\) => [\{|\(][\s\S]*?(<\/motion\.nav>\n\s*\)\n|<\/motion\.nav>\n\s*\}\n)/;

        if (navbarRegex.test(content)) {
            content = content.replace(navbarRegex, '');
            console.log(`Replaced in ${f}`);
        }

        // Also, if it's the profile page, we might want to swap out the usages of `<Navbar />` with `<AuthNavbar />` 
        // or just leave it since the user asked about other pages, wait. The user asked "did u update all the other pages file replacing this code with the components?"
        // If I leave `<Navbar />` inside user/profile/page.js without definition, it will crash.
        // I should simply replace `<Navbar />` with a local implementation or use something else.
        // Instead of deleting the Navbar in profile/page.js using this script, let me just undo the deletion for that if needed. Wait, the user said "make sure that shared elements—like the navbar—are created as individual components in the components folder and imported into each page from there."
        // So for user/profile/page.js I can use a `ProfileNavbar` component. Or maybe we can just make `UserNavbar` component in components. Let's do that!

        fs.writeFileSync(f, content);
    }
}
