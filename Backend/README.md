# Notes API

A small backend project I built to practice **real-world API behavior**, not just basic CRUD.

This is a **Node.js + Express + TypeScript + MongoDB** REST API where users can create notes, own them, delete them safely, and recover them later.

---

## What this project does

* Users sign up and sign in using JWT
* Each note belongs to a single user
* Users can only read or modify their own notes
* Notes are **soft deleted** (moved to trash, not removed)
* Deleted notes can be restored
* Notes can be permanently deleted only from trash

---

## Why I built it

Most beginner projects stop at "create, read, update, delete". In real products:

* data is owned by users
* deletes are usually reversible
* APIs must protect against ID misuse

This project was built to practice those rules.

---

## Tech used

* Node.js
* Express
* TypeScript
* MongoDB (Mongoose)
* JWT authentication

---

## Main routes

* `POST /signup`
* `POST /signin`
* `GET /notes`
* `POST /notes`
* `PUT /notes/:noteId`
* `DELETE /notes/:noteId` (soft delete)
* `GET /notes/trash`
* `PATCH /notes/:noteId/restore`
* `DELETE /notes/:noteId/permanent`

---

## Running locally

1. Clone the repo
2. Install dependencies
3. Create a `.env` file:

```
JWT_SECRET=your_secret
MONGODB_URI=your_mongo_uri
```

4. Start the server

```
npm run dev
```

