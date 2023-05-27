const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');


//ROUTE-1 fetchin all notes of a user using GET :: Login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);

    } catch (error) {
        return res.status(400).send('Error Occured');
    }
}); //ENd of fetch all notes

//ROUTE-2 Add a note Using POST :: Login required
router.post('/addnote', fetchUser, [
    body('title', 'Enter a Valid title').isLength({ min: 3 }),
    body('description', 'Enter a Valid Description of minimum 20 characters').isLength({ min: 5 }),
], async (req, res) => {
    // Error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Destructuring to get info out from req.body
    const { title, description, tag } = req.body;
    try {
        const notes = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await notes.save();
        res.send(savedNote);

    } catch (error) {
        return res.status(400).send('Error Occured');
    }
}); //End of ROUTE-2 Add a user

// ROUTE-3 Update a note using PUT :: Login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    // destructuring
    const { title, description, tag } = req.body;
    const newNote = {}
    try {
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // check if the user is authenticated
        let note = await Notes.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) { return res.status(400).send("Not Allowd") }

        // Update the note
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    } catch (error) {
        return res.status(40).send({ error: 'Error Occured' });
    }
}); //End of update note 

// ROUTE-4 Delete a Note using DELETE :: Login Required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // check if the user is authenticated
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) { return res.status(400).send("Not Allowed") }

        // after the authentication delte the note
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Successfully Deleted", note: note })

    } catch (error) {
        return res.status(400).send({ error: 'Error Occured' });
    }
}); //End of ROUTE-4 Delete Note

module.exports = router