const express = require('express');
const path = require('path');
const cors = require('cors');
const chalk = require('chalk');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 4005;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    maxAge: 0
}));

app.listen(PORT, () => {
    console.log(chalk.bold.cyan(`\n==================================================================`));
    console.log(chalk.bold.cyan(`HYDRX MAGICBLOCK ER PERFORMANCE DASHBOARD RUNNING`));
    console.log(chalk.bold.cyan(`• Live Dashboard: http://localhost:${PORT}`));
    console.log(chalk.bold.cyan(`==================================================================\n`));
});
