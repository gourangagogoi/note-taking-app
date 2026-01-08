import { Response, Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Note } from "../models/note.model";
import { authMiddleware } from "../middleware/auth.middleware";
import { AuthRequest } from "../types/auth";

export const userRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

userRoutes.post("/signup", async(req: AuthRequest, res: Response)=>{
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({ msg: "Missing Credentials"});
    }
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(409).json({
            msg: "User already exists"
        });
    }
    await User.create({
        email,
        password
    })
    res.json({msg: "User created successfully"});
});

userRoutes.post("/signin", async(req: AuthRequest, res: Response)=>{
    const { email, password } = req.body;
    const user = await User.findOne({ email, password })
    if(!user){
        return res.status(401).json({ msg : "Invalid Credentials"});
    }
    const token = jwt.sign(
        {userId: user._id, email: user.email},
        JWT_SECRET,
        {expiresIn: "7d"}
    );
    res.json({
        msg: "Signed In",
        token
     });
});

userRoutes.get("/notes", authMiddleware, async(req: AuthRequest, res: Response)=>{
    const notes = await Note.find({
        userId: req.userId,
        isDeleted: false
    });
    res.json({ notes })
});

userRoutes.post("/notes", authMiddleware, async(req: AuthRequest, res: Response)=>{
    const { title, content } = req.body;

    const note = await Note.create({
        title,
        content,
        userId: req.userId
    });
    res.json({
        msg: "Note created",
        noteId: note._id   //for full note "note: note"
    })
})

userRoutes.put("/notes/:noteId",authMiddleware, async(req: AuthRequest, res: Response)=>{
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(
        {_id: noteId, userId: req.userId },
        req.body,
        {new: true}
    );
    if(!note){
        return res.status(404).json({ msg: "Note not found"});
    }
    res.json({note});
});

//soft delete
userRoutes.delete("/notes/:noteId", authMiddleware, async(req: AuthRequest, res: Response)=>{
    const {noteId} = req.params;

    const note = await Note.findByIdAndUpdate(
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
    res.json({ msg: "Note removed to trash"})
});

// deleted notes
userRoutes.get("/notes/trash", authMiddleware, async(req: AuthRequest, res: Response)=>{
    const notes =await Note.find({
        userId: req.userId,
        isDeleted: true
    });
    res.json({notes})
})

//restore
userRoutes.patch("/notes/:noteId/restore", authMiddleware, async(req: AuthRequest, res: Response)=>{
    const {noteId} = req.params;

    const note = await Note.findOneAndUpdate(
        {_id: noteId, userId: req.userId, isDeleted: true},
        {isDeleted: false, deletedAt: null},
        {new: true}
    );
    if(!note){
        return res.status(404).json({ msg : "Note not found"});
    }
    res.json({msg: "Note restored"});
})


userRoutes.delete("/notes/:noteId/parmanent",authMiddleware, async(req: AuthRequest, res: Response)=>{
    const {noteId} = req.params;
    const note = await Note.findOneAndDelete(
        { _id: noteId, userId: req.userId,isDeleted: true }
    );
     if(!note){
        return res.status(404).json({ msg : "Note not found"});
    }
        res.json({msg: "Note Deleted"});
})