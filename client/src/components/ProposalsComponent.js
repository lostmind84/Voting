import React, { useRef, useEffect, useState } from "react";
import { Button, Row, Col, Card, Form, ListGroup } from "react-bootstrap";

const ProposalsComponent = (props) => {
  const context = props.context;
  const currentStatus = props.currentStatus;
  const addProposalInput = useRef(null);
  const [proposalList, setProposalList] = useState([]);
  const [proposalAdded, setproposalAdded] = useState(false);

  const proposalRegisteredCallback = async (error, result) => {
    if (!error) {
      setproposalAdded(true);
    } else console.log(error);
  };

  async function subscribe() {
    // subscribe to event
    await context.contract.events.ProposalRegistered(
      null,
      proposalRegisteredCallback
    );

    // refresh already registered proposals
    await context.contract.getPastEvents(
      "ProposalRegistered",
      { fromBlock: 0 },
      async function (error, events) {
        console.log("pasEvents found for ProposalRegistered");
        let result = [];
        events.map((e, i) => {
          try {
            const id = e.returnValues._proposalId;
            result.push(getProposal(id));
          } catch (error) {
            console.log(error);
          }
        });

        // resolve promises
        let result2 = [];
        await Promise.all(result).then((res) => {
          result2 = res;
        });

        setProposalList(result2);
      }
    );
  }

  const getProposal = async (id) => {
    return await context.contract.methods.proposalsArray(id).call();
  };

  useEffect(() => {
    subscribe();
    setproposalAdded(false);
  }, [proposalAdded]);

  const addProposal = async (event) => {
    try {
      await context.contract.methods
        .addProposal(addProposalInput.current.value)
        .send({ from: context.accounts[0] });
    } catch (error) {
      console.log(error);
    }
  };

  const getButton = () => {
    if (currentStatus === 1)
      return (
        <Button variant="primary" onClick={addProposal}>
          Register
        </Button>
      );
    else
      return (
        <Button variant="secondary" onClick={addProposal} disabled>
          Not available
        </Button>
      );
  };

  const getVoteButton = (id) => {
    if (currentStatus === 1) return;
    else if (currentStatus === 3)
      return (
        <Button
          variant="success"
          onClick={() => {
            voteForProposal(id);
          }}
        >
          Vote !
        </Button>
      );
  };

  const voteForProposal = async (id) => {
    try {
      await context.contract.methods
        .setVote(id)
        .send({ from: context.accounts[0] });

      setproposalAdded(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Row className="mt-2">
      <Col></Col>
      <Col xs={10}>
        <Card className="text-center">
          <Card.Body>
            <Card.Title>3. Register proposals</Card.Title>
            <Form>
              <Form.Control
                type="text"
                placeholder="Enter a proposal"
                className="mb-2"
                ref={addProposalInput}
              />
              {getButton()}
            </Form>

            <br />
            <h5>Already registered proposals</h5>
            <ListGroup className="text-left">
              {proposalList.map((prop, i) => {
                return (
                  <ListGroup.Item key={i}>
                    {`[${i}][Votes:${prop.voteCount}] ${prop.description}`}
                    &nbsp;&nbsp;{getVoteButton(i)}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
            <ul></ul>
          </Card.Body>
        </Card>
      </Col>
      <Col></Col>
    </Row>
  );
};

export default ProposalsComponent;
