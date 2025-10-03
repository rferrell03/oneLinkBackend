import express from 'express';
import cors from 'cors';
import router from './routes';
import { fileURLToPath } from "url";
import { dirname, join } from "path";




const app = express(); 
app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());

app.use('/api', router);
app.use('/health', (req, res) => res.send('OK'));


app.use(express.static(join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;