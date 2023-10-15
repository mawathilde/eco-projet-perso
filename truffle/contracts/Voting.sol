// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    // Structures de données
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    // Énumération pour gérer les différents états d'un vote
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    uint public winningProposalId;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    // Événements
    event VoterRegistered(address indexed voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address indexed voter, uint proposalId);

    constructor(address initialOwner) Ownable(initialOwner) {
        workflowStatus = WorkflowStatus.RegisteringVoters;
    }

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "L'expediteur n est pas un electeur inscrit");
        _;
    }

    modifier inState(WorkflowStatus _status) {
        require(workflowStatus == _status, "Invalid workflow state");
        _;
    }

    function registerVoter(address _voterAddress) external onlyOwner inState(WorkflowStatus.RegisteringVoters) {
        require(!voters[_voterAddress].isRegistered, "Le votant est deja inscrit");
        voters[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    function startProposalsRegistration() external onlyOwner inState(WorkflowStatus.RegisteringVoters) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistration() external onlyOwner inState(WorkflowStatus.ProposalsRegistrationStarted) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function registerProposal(string memory _description) external onlyRegisteredVoter inState(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal({ description: _description, voteCount: 0 }));
        emit ProposalRegistered(proposals.length - 1);
    }

    function startVotingSession() external onlyOwner inState(WorkflowStatus.ProposalsRegistrationEnded) {
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    function endVotingSession() external onlyOwner inState(WorkflowStatus.VotingSessionStarted) {
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    function vote(uint _proposalId) external onlyRegisteredVoter inState(WorkflowStatus.VotingSessionStarted) {
        require(_proposalId < proposals.length, "ID de la proposition invalide");
        require(!voters[msg.sender].hasVoted, "Le votant a deja vote");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    function tallyVotes() external onlyOwner inState(WorkflowStatus.VotingSessionEnded) {
        uint maxVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVoteCount) {
                maxVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    function getWinner() external view returns (uint) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Les votes n'ont pas encore ete comptabilises");
        return winningProposalId;
    }
}
