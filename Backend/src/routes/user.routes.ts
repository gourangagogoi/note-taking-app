import { Response, Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Note } from "../models/note.model";
import { authMiddleware } from "../middleware/auth.middleware";
import { AuthRequest } from "../types/auth";
import bcrypt from "bcrypt";
import { signinSchema, signupSchema } from "../validation/auth.schema";
import { createNoteSchema, listNotesQuerySchema, noteIdParamSchema, updateNoteSchema } from "../validation/note.schema";
import { signinLimiter, signupLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";


export const userRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

userRoutes.post("/signup",signupLimiter, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const parsed = signupSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(400).json({ error: "Invalid Input"})
    }

    const { email, password } = parsed.data;

    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(409).json({
            msg: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        email,
        password: hashedPassword
    })
    res.status(201).json({msg: "User created successfully"});
})
);

userRoutes.post("/signin",signinLimiter, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const parsed = signinSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(400).json({ error: "Invalid Input"});
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email })
    if(!user){
        return res.status(401).json({ msg : "Invalid Credentials"});
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
         return res.status(401).json({ msg : "Invalid Credentials"});
    }
    const token = jwt.sign(
        {userId: user._id, email: user.email},
        JWT_SECRET,
        {expiresIn: "7d"}
    );
    res.status(200).json({
        msg: "Signed In",
        token
     });
})
);

userRoutes.get("/notes", authMiddleware, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const parsed = listNotesQuerySchema.safeParse(req.query);

    if(!parsed.success){
        return res.status(400).json({
            error: "Invalid query input"
        });
    }
    let limit = Number(parsed.data.limit) || 20;
    let page = Number(parsed.data.page) || 1;

    const maxLimit = 50;
    if(limit>maxLimit){
        limit = maxLimit;
    }
    if(page<1){
        page=1;
    }
    const skip = (page-1)*limit;

    const notes = await Note.find({
        userId: req.userId,
        isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.status(200).json({ notes })
})
);

userRoutes.post("/notes", authMiddleware, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const parsed = createNoteSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(400).json({ error: "Invalid input"})
    }
    const { title, content } = parsed.data;

    const note = await Note.create({
        title,
        content,
        userId: req.userId
    });
    res.status(201).json({
        msg: "Note created",
        noteId: note._id   //for full note "note: note"
    })
})
)

userRoutes.put("/notes/:noteId",authMiddleware, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const paramsParsed = noteIdParamSchema.safeParse(req.params);

    if(!paramsParsed.success){
        return res.status(400).json({ error: "Invalid note id"});
    }
    const {noteId}= paramsParsed.data;
    const bodyParsed = updateNoteSchema.safeParse(req.body);
    if(!bodyParsed.success){
        return res.status(400).json({ error: "Invalid input"});
    };
    const updateData = bodyParsed.data

    if(Object.keys(updateData).length===0){
        return res.status(400).json({ error: "No fields to update"})
    }
    const note = await Note.findOneAndUpdate(
        {_id: noteId, userId: req.userId, isDeleted: false },
        updateData,
        {new: true}
    );
    if(!note){
        return res.status(404).json({ msg: "Note not found"});
    }
    res.status(200).json({note});
})
);

//soft delete
userRoutes.delete("/notes/:noteId", authMiddleware, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const parsed = noteIdParamSchema.safeParse(req.params);
    if(!parsed.success){
        return res.status(400).json({ error: "Invalid note id"})
    }
    const {noteId} = parsed.data;

    const note = await Note.findOneAndUpdate(
        {_id: noteId, userId: req.userId, isDeleted: false},
        {
        isDeleted: true,
         deletedAt: new Date(),
        },
        {new: true}
    );
    if(!note){
        return res.status(404).json({ msg: "Note not found "});
    }
    console.log(`(Soft-Delete) user=${req.userId}, note=${noteId}`)
    res.json({ msg: "Note removed to trash"})
})
);

// deleted notes
userRoutes.get("/notes/trash", authMiddleware, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const notes =await Note.find({
        userId: req.userId,
        isDeleted: true
    });
    res.json({notes})
})
);

//restore
userRoutes.patch("/notes/:noteId/restore", authMiddleware, asyncHandler( async(req: AuthRequest, res: Response)=>{
    const parsed = noteIdParamSchema.safeParse(req.params);
    if(!parsed.success){
        return res.status(400).json({ error: "Invalid note id"})
    }
    const {noteId} = parsed.data;


    const note = await Note.findOneAndUpdate(
        {_id: noteId, userId: req.userId, isDeleted: true},
        {isDeleted: false, deletedAt: null},
        {new: true}
    );
    if(!note){
        return res.status(404).json({ msg : "Note not found"});
    }
    console.log(`(Restored) user=${req.userId}, note=${noteId}`)
    res.status(200).json({msg: "Note restored"});
})
);


userRoutes.delete("/notes/:noteId/permanent",authMiddleware, asyncHandler(async(req: AuthRequest, res: Response)=>{
    const parsed = noteIdParamSchema.safeParse(req.params);
    if(!parsed.success){
        return res.status(400).json({ error: "Invalid note id"})
    }
    const {noteId} = parsed.data;

    const note = await Note.findOneAndDelete(
        { _id: noteId, userId: req.userId,isDeleted: true }
    );
     if(!note){
        return res.status(404).json({ msg : "Note not found"});
    }
    console.log(`(Permanent-Delete) user=${req.userId}, note=${noteId}`)
        res.status(204).end();
})
);