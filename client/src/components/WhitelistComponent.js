import React, { useRef, useEffect, useState } from "react";
import { Button, Row, Col, Card, Form, ListGroup } from "react-bootstrap";

const WhitelistComponent = (props) => {
  const context = props.context;
  const currentStatus = props.currentStatus;
  const addToWhiteListInput = useRef(null);
  const [voters, setVoters] = useState([]);
  const [voterAdded, setvoterAdded] = useState(false);

  const voterRegisteredCallback = (error, result) => {
    if (!error) {
      //console.log(result.returnValues._voterAddress);
      const arrVoters = voters;
      arrVoters.push(result.returnValues._voterAddress);
      setVoters(arrVoters);
      setvoterAdded(true);
    } else console.log(error);
  };

  async function subscribe() {
    // subscribe to event
    await context.contract.events.VoterRegistered(
      null,
      voterRegisteredCallback
    );

    // refresh already registered voters
    await context.contract.getPastEvents(
      "VoterRegistered",
      { fromBlock: 0 },
      function (error, events) {
        console.log("pasEvents found for VoterRegistered");
        let result = [];
        events.map((e, i) => {
          result.push(e.returnValues._voterAddress);
        });
        setVoters(result);
      }
    );
  }

  useEffect(() => {
    subscribe();
    setvoterAdded(false);
  }, [voterAdded]);

  const addToWhitelist = async (event) => {
    try {
      await context.contract.methods
        .addVoter(addToWhiteListInput.current.value)
        .send({ from: context.accounts[0] });
    } catch (error) {
      console.log(error);
    }
  };

  const getButton = () => {
    if (currentStatus === 0)
      return (
        <Button variant="primary" onClick={addToWhitelist}>
          Add
        </Button>
      );
    else
      return (
        <Button variant="secondary" onClick={addToWhitelist} disabled>
          Add
        </Button>
      );
  };

  return (
    <Row className="mt-2">
      <Col></Col>
      <Col xs={7}>
        <Card className="text-center">
          <Card.Body>
            <Card.Title>1. Whitelist participants</Card.Title>
            <Form inline>
              <Form.Control
                type="text"
                placeholder="Enter an address to whitelist"
                className="mr-2"
                ref={addToWhiteListInput}
              />
              {getButton()}
            </Form>

            <br />
            <h5>Already registered voters</h5>
            <ListGroup>
              {voters.length > 0
                ? voters.map((voter, i) => {
                    return <ListGroup.Item key={i}>{voter}</ListGroup.Item>;
                  })
                : ""}
            </ListGroup>
            <ul></ul>
          </Card.Body>
        </Card>
      </Col>
      <Col></Col>
    </Row>
  );
};

export default WhitelistComponent;
