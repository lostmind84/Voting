## `Voting`

Protocol to enable users to create and vote on proposals




### `onlyVoters()`


Only registered voters can access
/




### `getVoter(address _addr) → struct Voting.Voter` (external)

Returns Voter information. Only available for registered voters




### `getOneProposal(uint256 _id) → struct Voting.Proposal` (external)

Returns a Proposal




### `getWinner() → struct Voting.Proposal` (external)

Returns the winning Proposal
/



### `addVoter(address _addr)` (external)

Register an address as Voter




### `addProposal(string _desc)` (external)

Add a proposal. Only voters can do it.




### `setVote(uint256 _id)` (external)

Vote for a proposal. Only voters can do it.




### `startProposalsRegistering()` (external)

Starts proposals registration. Updates workflow status to ProposalsRegistrationStarted. Only owner.
/
    f



### `endProposalsRegistering()` (external)

Ends proposals registration. Updates workflow status to ProposalsRegistrationEnded. Only owner.
/
    f



### `startVotingSession()` (external)

Starts voting session. Updates workflow status to VotingSessionStarted. Only owner.
/
    f



### `endVotingSession()` (external)

Ends voting session. Updates workflow status to VotingSessionEnded. Only owner.
/
    f



### `tallyVotes()` (external)

Tally votes and set the winning proposal. Only owner.
/
    f




### `VoterRegistered(address _voterAddress)`


Signals when voter is registered




### `WorkflowStatusChange(enum Voting.WorkflowStatus _previousStatus, enum Voting.WorkflowStatus _newStatus)`


Signals when workflow status changes




### `ProposalRegistered(uint256 _proposalId)`


Signals when a proposal is registered




### `Voted(address _voter, uint256 _proposalId)`


Signals when a voter vote for a proposal





### `Voter`


bool isRegistered


bool hasVoted


uint256 votedProposalId


### `Proposal`


string description


uint256 voteCount



### `WorkflowStatus`




















