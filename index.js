import sequelize from './shared/database/database.js'
import { usersRouter } from "./users/router.js"
import fs from 'fs';
import express from 'express'

const app = express()
const PORT = 8000

sequelize.sync({ force: true }).then(() => console.log('db is ready'))

app.use(express.json())
app.use('/api/users', usersRouter)

app.get('/health', (req, res) => {
    console.log('HEALTH STATUS OK')
    res.status(200).send('Health check OK');
});

const server = app.listen(PORT, () => {
    console.log('Server running on port PORT', PORT)
})

const configValue = process.env.CONFIG_1;
console.log(configValue);

export { app, server }