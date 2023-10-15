const Voting = artifacts.require('Voting');

contract('Voting', (accounts) => {
    let votingInstance;

    before(async () => {
        // Déployer le contrat avant chaque test
        votingInstance = await Voting.new(accounts[0]);
    });

    it('devrait inscrire un electeur', async () => {
        await votingInstance.registerVoter(accounts[1], { from: accounts[0] });
        const estInscrit = await votingInstance.voters.call(accounts[1]);
        assert.isTrue(estInscrit.isRegistered);
    });

    it('devrait démarrer et terminer l\'enregistrement des propositions', async () => {
        await votingInstance.startProposalsRegistration({ from: accounts[0] });
        let statut = await votingInstance.workflowStatus.call();
        assert.equal(statut, 1); // ProposalsRegistrationStarted

        await votingInstance.endProposalsRegistration({ from: accounts[0] });
        statut = await votingInstance.workflowStatus.call();
        assert.equal(statut, 2); // ProposalsRegistrationEnded
    });

    it('devrait permettre à un electeur de voter', async () => {
        await votingInstance.registerVoter(accounts[2], { from: accounts[0] });
        await votingInstance.startProposalsRegistration({ from: accounts[0] });
        await votingInstance.endProposalsRegistration({ from: accounts[0] });
        await votingInstance.startVotingSession({ from: accounts[0] });

        const propositionId = 0; // Supposons que la première proposition soit enregistrée
        await votingInstance.vote(propositionId, { from: accounts[2] });

        const electeur = await votingInstance.voters.call(accounts[2]);
        assert.isTrue(electeur.hasVoted);
        assert.equal(electeur.votedProposalId, propositionId);
    });

    it('devrait comptabiliser les votes et déterminer le gagnant', async () => {
        await votingInstance.registerProposal("Proposition A", { from: accounts[0] });
        await votingInstance.registerProposal("Proposition B", { from: accounts[0] });

        await votingInstance.startVotingSession({ from: accounts[0] });
        await votingInstance.vote(0, { from: accounts[1] });
        await votingInstance.vote(1, { from: accounts[2] });
        await votingInstance.vote(0, { from: accounts[3] });

        await votingInstance.endVotingSession({ from: accounts[0] });
        await votingInstance.tallyVotes({ from: accounts[0] });

        const gagnantId = await votingInstance.getWinner();
        assert.equal(gagnantId, 0); // Proposition A a reçu plus de votes
    });

    // ... Ajoutez d'autres tests en fonction de vos besoins ...

});