import React, { useEffect, useState } from "react";
import { Row, Col, Badge, Card } from "react-bootstrap";

const HeaderComponent = (props) => {
  const context = props.context;
  const [owner, setOwner] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");
  const currentStatus = props.currentStatus;
  const setCurrentStatus = props.setCurrentStatus;

  useEffect(() => {
    getOwner();
    getStatus();

    setCurrentWallet(
      `${context.accounts[0].substring(0, 5)}...${context.accounts[0].substring(
        38,
        context.accounts[0].length
      )}`
    );
  }, [currentStatus, context]);

  const getOwner = async () => {
    const o = await context.contract.methods.owner().call();
    if (context.accounts[0] === o) setOwner(`${o} (you)`);
    else setOwner(o);
  };

  const getStatus = async () => {
    const o = await context.contract.methods.workflowStatus().call();
    setCurrentStatus(parseInt(o));
  };

  const getStatusText = function () {
    if (currentStatus === 0) return "Registering voters (1.)";
    else if (currentStatus === 1) return "Proposal registration started (3.)";
    else if (currentStatus === 2) return "Proposal registration ended (4.)";
    else if (currentStatus === 3) return "Voting session started (5.)";
    else if (currentStatus === 4) return "Voting session ended (6.)";
    else if (currentStatus === 5) return "Vote tallied (7.)";
  };

  return (
    <Row className="mt-2">
      <Col></Col>
      <Col xs={10}>
        <Card className="text-center">
          <Card.Body>
            <Card.Title>Connected</Card.Title>
            <b>Current wallet : </b>
            <Badge variant="success">{currentWallet}</Badge>
            <br />
            <b>Contract address : </b>
            {` ${context.contract._address}`}
            <br />
            <b>Contract owner : </b>
            {` ${owner}`}
            <br />
            <b>Current status : </b>{" "}
            <h4>
              <Badge variant="info">{getStatusText()}</Badge>
            </h4>
          </Card.Body>
        </Card>
      </Col>
      <Col></Col>
    </Row>
  );
};

export default HeaderComponent;
