import React, { useEffect } from "react";
import { Button, Row, Col, Card } from "react-bootstrap";

const StatusChange = (props) => {
  const context = props.context;
  const currentStatus = props.currentStatus;
  const setCurrentStatus = props.setCurrentStatus;
  const initialStatus = props.initialStatus; // Status linked to component position in dapp

  const workflowStatusChangeCallback = (error, result) => {
    if (!error) {
      setCurrentStatus(result.returnValues._newStatus);
    } else console.log(error);
  };

  async function subscribe() {
    // subscribe to event
    await context.contract.events.WorkflowStatusChange(
      null,
      workflowStatusChangeCallback
    );
  }

  useEffect(() => {
    subscribe();
  }, []);

  const changeStatus = async () => {
    try {
      if (initialStatus === 0) {
        await context.contract.methods
          .startProposalsRegistering()
          .send({ from: context.accounts[0] });
      } else if (initialStatus === 1)
        await context.contract.methods
          .endProposalsRegistering()
          .send({ from: context.accounts[0] });
      else if (initialStatus === 2)
        await context.contract.methods
          .startVotingSession()
          .send({ from: context.accounts[0] });
      else if (initialStatus === 3)
        await context.contract.methods
          .endVotingSession()
          .send({ from: context.accounts[0] });
      else if (initialStatus === 4)
        await context.contract.methods
          .tallyVotes()
          .send({ from: context.accounts[0] });
    } catch (error) {
      console.log(error);
    }
  };

  const getButton = () => {
    if (
      initialStatus === currentStatus &&
      context.contractOwner === context.accounts[0]
    )
      return (
        <Button variant="primary" onClick={changeStatus}>
          Change status
        </Button>
      );
    else if (context.contractOwner !== context.accounts[0])
      return (
        <Button variant="secondary" onClick={changeStatus} disabled>
          (Only owner)
        </Button>
      );
    else {
      return (
        <Button variant="secondary" onClick={changeStatus} disabled>
          Not available
        </Button>
      );
    }
  };

  return (
    <Row className="mt-2">
      <Col></Col>
      <Col xs={7}>
        <Card className="text-center" border="warning" text="error">
          <Card.Body>
            <Card.Title>{props.Title}</Card.Title>
            {getButton()}
          </Card.Body>
        </Card>
      </Col>
      <Col></Col>
    </Row>
  );
};

export default StatusChange;
