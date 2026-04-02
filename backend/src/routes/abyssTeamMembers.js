const express = require('express');
const router = express.Router();
const AbyssTeamMemberController = require('../controllers/abyssTeamMemberController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', AbyssTeamMemberController.getMembers);

router.post('/', AbyssTeamMemberController.addMember);

router.put('/:id', AbyssTeamMemberController.updateMember);

router.delete('/:id', AbyssTeamMemberController.removeMember);

router.get('/my-teams', AbyssTeamMemberController.getMyTeams);

module.exports = router;
