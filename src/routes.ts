import { Router } from "express";
import {z} from "zod";
import {prisma} from "./prisma";
import makeCode from "./code";

const router = Router();

const safeBody = z.object({
    url: z.string().url(),
});


router.post('/shorten', async (req, res) => {
    // Safely parses input
    const parseResult = safeBody.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { url } = parseResult.data;


    //Checks to see if a link already exists in the DB
    const existingLink = await prisma.link.findFirst({ where: { longURL: url } });
    if (existingLink) {
        return res.json({ code: existingLink.code });
    }

    
    //Creates new code
    let code = makeCode(6);
    while (await prisma.link.findUnique({ where: { code } })) {
        code = makeCode(6);
    }

    //Stores in DB
    const newLink = await prisma.link.create({
        data: {
            code,
            longURL: url,
        },
    });

    res.json({ code: `${newLink.code}` });
});

router.get('/:code', async (req, res) => {

    //Gets code from params
    const code = req.params.code;

    
    //Finds link in DB
    const link = await prisma.link.findUnique({ where: { code } });

    if (!link) {
        return res.status(404).json({ error: "Link not found" });
    }

    //Update click count
    await prisma.link.update({
        where: { code },
        data: { clicks: link.clicks + 1 },
    });

    //Redirects to long URL
    res.redirect(link.longURL);
});





export default router;