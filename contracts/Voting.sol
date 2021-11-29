// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voting Defi Contract
 * @notice Protocol to enable users to create and vote on proposals
 * @author Fabien Frick
 */
contract Voting is Ownable {
    // Contract ordering structure
    // 1. State variables
    // 2. Events
    // 3. Function Modifiers
    // 4. Struct, Arrays or Enums
    // 5. Constructor
    // 6. Fallback — Receive function
    // 7. External visible functions
    // 8. Public visible functions
    // 9. Internal visible functions
    // 10. Private visible functions

    // 1. State variables

    /**
     * @notice Winning proposal id
     */
    uint256 public winningProposalId;

    // arrays used in case of draw
    uint256[] winningProposalsID;
    Proposal[] winningProposals;

    /**
     * @notice Proposals array
     */
    Proposal[] public proposalsArray;

    /**
     * @notice Workflow status
     */
    WorkflowStatus public workflowStatus;

    // 2. Events

    /**
     * @notice Signals when voter is registered
     * @param _voterAddress The voter address registered
     */
    event VoterRegistered(address _voterAddress);

    /**
     * @notice Signals when workflow status changes
     * @param _previousStatus The previous status
     * @param _newStatus The new status
     */
    event WorkflowStatusChange(
        WorkflowStatus _previousStatus,
        WorkflowStatus _newStatus
    );

    /**
     * @notice Signals when a proposal is registered
     * @param _proposalId proposal id
     */
    event ProposalRegistered(uint256 _proposalId);

    /**
     * @notice Signals when a voter vote for a proposal
     * @param _voter proposal address
     * @param _proposalId proposal id
     */
    event Voted(address _voter, uint256 _proposalId);

    // 3. modifiers
    /**
     * @notice Only registered voters can access
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    // on peut faire un modifier pour les états

    // 4. Struct ....
    /**
     * @notice Voter struct
     */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    /**
     * @notice Proposal struct
     */
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    /**
     * @notice WorkflowStatus enum
     */
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * @notice Internal voters mapping
     */
    mapping(address => Voter) private voters;

    // 5. Constructor
    // 6. Fallback — Receive function
    // 7. External visible functions
    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @notice Returns Voter information. Only available for registered voters
     * @param _addr Voter address
     */
    function getVoter(address _addr)
        external
        view
        onlyVoters
        returns (Voter memory)
    {
        return voters[_addr];
    }

    /**
     * @notice Returns a Proposal
     * @param _id Voter address
     */
    function getOneProposal(uint256 _id)
        external
        view
        onlyVoters
        returns (Proposal memory)
    {
        return proposalsArray[_id];
    }

    /**
     * @notice Returns the winning Proposal
     */
    function getWinner() external view returns (Proposal memory) {
        require(
            workflowStatus == WorkflowStatus.VotesTallied,
            "Votes are not tallied yet"
        );
        return proposalsArray[winningProposalId];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: //

    /**
     * @notice Register an address as Voter
     * @param _addr Address to register as a Voter
     */
    function addVoter(address _addr) external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            "Voters registration is not open yet"
        );
        require(voters[_addr].isRegistered != true, "Already registered");

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    /* facultatif
     * function deleteVoter(address _addr) external onlyOwner {
     *   require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
     *   require(voters[_addr].isRegistered == true, 'Not registered.');
     *   voters[_addr].isRegistered = false;
     *  emit VoterRegistered(_addr);
    }*/

    // ::::::::::::: PROPOSAL ::::::::::::: //

    /**
     * @notice Add a proposal. Only voters can do it.
     * @param _desc Description of the proposal
     */
    function addProposal(string memory _desc) external onlyVoters {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposals are not allowed yet"
        );
        require(
            keccak256(abi.encode(_desc)) != keccak256(abi.encode("")),
            "Vous ne pouvez pas ne rien proposer"
        ); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length - 1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /**
     * @notice Vote for a proposal. Only voters can do it.
     * @param _id Id of the proposal
     */
    function setVote(uint256 _id) external onlyVoters {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            "Voting session havent started yet"
        );
        require(voters[msg.sender].hasVoted != true, "You have already voted");
        require(_id <= proposalsArray.length, "Proposal not found"); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /**
     * @notice Starts proposals registration. Updates workflow status to ProposalsRegistrationStarted. Only owner.
     */
    function startProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            "Registering proposals cant be started now"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    /**
     * @notice Ends proposals registration. Updates workflow status to ProposalsRegistrationEnded. Only owner.
     */
    function endProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Registering proposals havent started yet"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    /**
     * @notice Starts voting session. Updates workflow status to VotingSessionStarted. Only owner.
     */
    function startVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
            "Registering proposals phase is not finished"
        );
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            WorkflowStatus.VotingSessionStarted
        );
    }

    /**
     * @notice Ends voting session. Updates workflow status to VotingSessionEnded. Only owner.
     */
    function endVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            "Voting session havent started yet"
        );
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted,
            WorkflowStatus.VotingSessionEnded
        );
    }

    /**
     * @notice Tally votes and set the winning proposal. Only owner.
     */
    function tallyVotes() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionEnded,
            "Current status is not voting session ended"
        );
        uint256 _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            if (
                proposalsArray[p].voteCount >
                proposalsArray[_winningProposalId].voteCount
            ) {
                _winningProposalId = p;
            }
        }
        winningProposalId = _winningProposalId;
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionEnded,
            WorkflowStatus.VotesTallied
        );
    }

    // 8. Public visible functions
    // 9. Internal visible functions
    // 10. Private visible functions
}
