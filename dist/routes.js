"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("./prisma");
const code_1 = __importDefault(require("./code"));
const router = (0, express_1.Router)();
const safeBody = zod_1.z.object({
    url: zod_1.z.string().url(),
});
router.post('/shorten', async (req, res) => {
    // Safely parses input
    const parseResult = safeBody.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { url } = parseResult.data;
    //Checks to see if a link already exists in the DB
    const existingLink = await prisma_1.prisma.link.findFirst({ where: { longURL: url } });
    if (existingLink) {
        return res.json({ code: existingLink.code });
    }
    //Creates new code
    let code = (0, code_1.default)(6);
    while (await prisma_1.prisma.link.findUnique({ where: { code } })) {
        code = (0, code_1.default)(6);
    }
    //Stores in DB
    const newLink = await prisma_1.prisma.link.create({
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
    const link = await prisma_1.prisma.link.findUnique({ where: { code } });
    if (!link) {
        return res.status(404).json({ error: "Link not found" });
    }
    //Update click count
    await prisma_1.prisma.link.update({
        where: { code },
        data: { clicks: link.clicks + 1 },
    });
    //Redirects to long URL
    res.redirect(link.longURL);
});
exports.default = router;
//# sourceMappingURL=routes.js.map