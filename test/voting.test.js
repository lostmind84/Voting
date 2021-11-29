const Voting = artifacts.require("Voting");

const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Voting", (accounts) => {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];
  const voter4 = accounts[4];
  const fromOwner = { from: owner };
  const fromVoter1 = { from: voter1 };
  const fromVoter2 = { from: voter2 };
  const fromVoter3 = { from: voter3 };
  const fromVoter4 = { from: voter4 };
  const ownableError = "Ownable: caller is not the owner";

  let ctx;

  before(async () => {
    ctx = await Voting.new({ from: owner });
  });

  // ::::::::::::: REGISTRATION ::::::::::::: //

  describe("REGISTRATION", async () => {
    it("Initial status should be RegisteringVoters", async () => {
      let status = await ctx.workflowStatus.call();
      expect(status).to.be.bignumber.equal(
        new BN(Voting.WorkflowStatus.RegisteringVoters)
      );
    });

    it("addVoter :: Should be for onlyOwner", async () => {
      await expectRevert(ctx.addVoter(voter1, fromVoter2), ownableError);
    });

    it("addVoter :: Should add voter1 and emit", async () => {
      let result = await ctx.addVoter(voter1, fromOwner);

      // add voter for future test
      await ctx.addVoter(voter2, fromOwner);
      await ctx.addVoter(voter3, fromOwner);

      // Check getVoter and onlyVoter modifier here too
      let voter = await ctx.getVoter(voter1, fromVoter1);

      expect(voter.isRegistered).to.be.equal(true);
      expectEvent(result, "VoterRegistered", { _voterAddress: voter1 });
    });

    it("addVoter :: Should not be possible to register twice", async () => {
      await expectRevert(ctx.addVoter(voter1, fromOwner), "Already registered");
    });
  });

  // ::::::::::::: PROPOSAL ::::::::::::: //

  describe("PROPOSAL", async () => {
    it("addProposal :: should reverts if status is not ProposalsRegistrationStarted", async () => {
      await expectRevert(
        ctx.addProposal("TEST", fromVoter1),
        "Proposals are not allowed yet"
      );
    });

    // ::::::::::::: startProposalsRegistering ::::::::::::: //

    describe("startProposalsRegistering", async () => {
      it("startProposalsRegistering :: Status change should be for onlyOwner", async () =>
        await statusOnlyOwnerCheck(ctx.startProposalsRegistering));

      it("startProposalsRegistering :: Status change to ProposalsRegistrationStarted and emit", async () =>
        await statusChangeCheck(
          ctx.startProposalsRegistering,
          ctx.workflowStatus,
          Voting.WorkflowStatus.ProposalsRegistrationStarted
        ));

      it("startProposalsRegistering :: Status change should fail if current is not RegisteringVoters", async () =>
        await statusChangeFailCheck(
          ctx.startProposalsRegistering,
          "Registering proposals cant be started now"
        ));
      //});
    });

    // ::::::::::::: addProposal ::::::::::::: //
    describe("addProposal", async () => {
      it("addProposal :: should be for onlyVoters", async () => {
        await expectRevert(
          ctx.addProposal("TEST", fromVoter4),
          "You're not a voter"
        );
      });

      it("addProposal :: should revert on empty proposals", async () => {
        await expectRevert(
          ctx.addProposal("", fromVoter1),
          "Vous ne pouvez pas ne rien proposer"
        );
      });

      it("addProposal :: should save proposal and emit", async () => {
        let result = await ctx.addProposal("Vote for A", fromVoter1);

        // add proposals for future tests
        await ctx.addProposal("Vote for B", fromVoter2);
        await ctx.addProposal("Vote for C", fromVoter3);

        let proposal = await ctx.proposalsArray.call(0);

        expect(proposal.description).to.be.equal("Vote for A");
        expectEvent(result, "ProposalRegistered", { _proposalId: new BN(0) });
      });
    });

    // ::::::::::::: endProposalsRegistering ::::::::::::: //
    describe("endProposalsRegistering", async () => {
      it("endProposalsRegistering :: Status change should be for onlyOwner", async () =>
        await statusOnlyOwnerCheck(ctx.endProposalsRegistering));

      it("endProposalsRegistering :: Status change to ProposalsRegistrationEnded and emit", async () =>
        await statusChangeCheck(
          ctx.endProposalsRegistering,
          ctx.workflowStatus,
          Voting.WorkflowStatus.ProposalsRegistrationEnded
        ));

      it("endProposalsRegistering :: Status change should fail if current is not ProposalsRegistrationStarted", async () =>
        await statusChangeFailCheck(
          ctx.endProposalsRegistering,
          "Registering proposals havent started yet"
        ));
    });

    describe("getOneProposal", async () => {
      it("getOneProposal :: should be onlyVoters", async () => {
        await expectRevert(
          ctx.getOneProposal(0, fromVoter4),
          "You're not a voter"
        );
      });

      it("getOneProposal :: should return the right proposal", async () => {
        let result = await ctx.getOneProposal(0, fromVoter3);

        expect(result.description).to.be.equal("Vote for A");
      });
    });
  });

  // ::::::::::::: VOTE ::::::::::::: //

  describe("VOTE", async () => {
    it("setVote :: should reverts if status is not VotingSessionStarted", async () => {
      let status = await ctx.workflowStatus.call();
      await expectRevert(
        ctx.setVote(new BN(0), fromVoter1),
        "Voting session havent started yet"
      );
    });

    // ::::::::::::: startVotingSession ::::::::::::: //

    describe("startVotingSession", async () => {
      it("startVotingSession :: Status change should be for onlyOwner", async () =>
        await statusOnlyOwnerCheck(ctx.startVotingSession));

      it("startVotingSession :: Status change to VotingSessionStarted and emit", async () =>
        await statusChangeCheck(
          ctx.startVotingSession,
          ctx.workflowStatus,
          Voting.WorkflowStatus.VotingSessionStarted
        ));

      it("startVotingSession :: Status change should fail if current is not VotingSessionStarted", async () =>
        await statusChangeFailCheck(
          ctx.startVotingSession,
          "Registering proposals phase is not finished"
        ));
    });

    // ::::::::::::: setVote ::::::::::::: //

    describe("setVote", async () => {
      it("setVote :: should be for onlyVoters", async () => {
        await expectRevert(
          ctx.setVote(new BN(0), fromVoter4),
          "You're not a voter"
        );
      });

      it("setVote :: should revert if proposal does not exist", async () => {
        await expectRevert(
          ctx.setVote(new BN(99), fromVoter1),
          "Proposal not found"
        );
      });

      it("setVote :: should save vote, increment proposal voteCount and emit", async () => {
        let result = await ctx.setVote(new BN(0), fromVoter1);

        let voter = await ctx.getVoter(voter1, fromVoter1);
        let proposal = await ctx.proposalsArray.call(0);

        // vote on other props for later use
        // "Vote for C" should win in the end
        await ctx.setVote(new BN(2), fromVoter2);
        await ctx.setVote(new BN(2), fromVoter3);

        expect(voter.votedProposalId).to.be.bignumber.equal(new BN(0));
        expect(voter.hasVoted).to.be.equal(true);
        expect(proposal.voteCount).to.be.bignumber.equal(new BN(1));
        expectEvent(result, "Voted", {
          _voter: voter1,
          _proposalId: new BN(0),
        });
      });

      it("setVote :: should revert if voter already vote", async () => {
        await expectRevert(
          ctx.setVote(new BN(0), fromVoter1),
          "You have already voted"
        );
      });
    });

    // ::::::::::::: endVotingSession ::::::::::::: //

    describe("endVotingSession", async () => {
      it("endVotingSession :: Status change should be for onlyOwner", async () =>
        await statusOnlyOwnerCheck(ctx.endVotingSession));

      it("endVotingSession :: Status change to VotingSessionStarted and emit", async () =>
        await statusChangeCheck(
          ctx.endVotingSession,
          ctx.workflowStatus,
          Voting.WorkflowStatus.VotingSessionEnded
        ));

      it("endVotingSession :: Status change should fail if current is not VotingSessionStarted", async () =>
        await statusChangeFailCheck(
          ctx.endVotingSession,
          "Voting session havent started yet"
        ));
    });
  });

  // ::::::::::::: TALLY ::::::::::::: //

  describe("TALLY", async () => {
    it("tallyVotes :: should be for onlyOwner", async () => {
      await expectRevert(ctx.tallyVotes(fromVoter1), ownableError);
    });

    it("tallyVotes :: should find a a winning proposalId, change status and emit", async () => {
      let previousStatus = await ctx.workflowStatus.call();
      let result = await ctx.tallyVotes(fromOwner);
      let newStatus = await ctx.workflowStatus.call();

      // winner should be id:2
      let winner = await ctx.getWinner();

      expectEvent(result, "WorkflowStatusChange", {
        _previousStatus: previousStatus,
        _newStatus: newStatus,
      });
      expect(newStatus).to.be.bignumber.equal(
        new BN(Voting.WorkflowStatus.VotesTallied)
      );
      expect(winner.description).to.be.equal("Vote for C");
      expect(winner.voteCount).to.be.bignumber.equal(new BN(2));
    });
  });

  // ::::::::::::: Private helpers ::::::::::::: //

  async function statusOnlyOwnerCheck(callback) {
    await expectRevert(callback(fromVoter1), ownableError);
  }

  async function statusChangeCheck(
    statusChangeFn,
    workflowStatusFn,
    newEnumStatus
  ) {
    let previousStatus = await workflowStatusFn.call();
    let result = await statusChangeFn(fromOwner);
    let newStatus = await workflowStatusFn.call();

    expectEvent(result, "WorkflowStatusChange", {
      _previousStatus: previousStatus,
      _newStatus: newStatus,
    });
    expect(newStatus).to.be.bignumber.equal(new BN(newEnumStatus));
  }

  async function statusChangeFailCheck(statusChangeFn, errorString) {
    await expectRevert(statusChangeFn(fromOwner), errorString);
  }
});
