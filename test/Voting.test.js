const { expect } = require("chai");

describe("Contrat Voting", function () {
    let Voting;
    let voting;
    let owner;
    let votant1;
    let votant2;
    let votant3;

    before(async () => {
        [owner, votant1, votant2, votant3] = await ethers.getSigners();

        Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy(owner.address);
        await voting.deployed();
    });

    it("Devrait s'initialiser avec le propriétaire = propriétaire initial", async function () {
        expect(await voting.owner()).to.equal(owner.address);
    });

    it("Devrait permettre au propriétaire d'enregistrer des votants", async function () {
        await voting.connect(owner).registerVoter(votant1.address);
        await voting.connect(owner).registerVoter(votant2.address);
        await voting.connect(owner).registerVoter(votant3.address);

        const votant1Data = await voting.voters(votant1.address);
        const votant2Data = await voting.voters(votant2.address);

        expect(votant1Data.isRegistered).to.equal(true);
        expect(votant1Data.hasVoted).to.equal(false);
        expect(votant1Data.votedProposalId).to.equal(0);

        expect(votant2Data.isRegistered).to.equal(true);
        expect(votant2Data.hasVoted).to.equal(false);
        expect(votant2Data.votedProposalId).to.equal(0);
    });

    it("Devrait permettre aux votants enregistrés de proposer et de voter", async function () {
        await voting.connect(owner).startProposalsRegistration();

        await voting.connect(votant1).registerProposal("Proposition 1");
        await voting.connect(votant2).registerProposal("Proposition 2");

        await voting.connect(owner).endProposalsRegistration();
        await voting.connect(owner).startVotingSession();

        await voting.connect(votant1).vote(0);

        await voting.connect(votant2).vote(1);
        await voting.connect(votant3).vote(1);

        const proposition1 = await voting.proposals(0);
        const proposition2 = await voting.proposals(1);

        expect(proposition1.voteCount).to.equal(1);
        expect(proposition2.voteCount).to.equal(2);

        const votant1Data = await voting.voters(votant1.address);
        const votant2Data = await voting.voters(votant2.address);

        expect(votant1Data.hasVoted).to.equal(true);
        expect(votant1Data.votedProposalId).to.equal(0);

        expect(votant2Data.hasVoted).to.equal(true);
        expect(votant2Data.votedProposalId).to.equal(1);
    });

    it("Devrait totaliser les votes et déterminer le gagnant", async function () {
        await voting.connect(owner).endVotingSession();
        await voting.connect(owner).tallyVotes();

        const gagnant = await voting.getWinner();
        expect(gagnant.toNumber()).to.equal(1); // Proposition 2 devrait être le gagnant
    });
});