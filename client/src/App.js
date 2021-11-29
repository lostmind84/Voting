import React, { useEffect, useState, Fragment } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import Web3 from "web3";

// internal components
import HeaderComponent from "./components/HeaderComponent.js";
import WhitelistComponent from "./components/WhitelistComponent.js";
import StatusChange from "./components/StatusChange";
import ProposalsComponent from "./components/ProposalsComponent";

import { Button, Container, Row, Col, Card } from "react-bootstrap";

import "./App.css";

function App() {
  const [context, setContext] = useState({
    web3: null,
    accounts: null,
    contract: null,
  });
  const [currentStatus, setCurrentStatus] = useState("");

  const initState = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = new Web3(window.ethereum);

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      //console.log(accounts);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      setContext({ web3: web3, accounts: accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  useEffect(() => {
    window.ethereum.on("accountsChanged", async () => {
      initState();
    });

    initState();
  }, []);

  if (!context.web3) {
    return (
      <Fragment>
        <Container>
          <Row>
            <Col></Col>
            <Col xs={6}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>Not connected !</Card.Title>
                  <Button variant="primary" onClick={initState}>
                    Connect
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col></Col>
          </Row>
        </Container>
      </Fragment>
    );
  } else
    return (
      <Fragment>
        <Container>
          <HeaderComponent
            context={context}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
          />
          <WhitelistComponent context={context} currentStatus={currentStatus} />
          <StatusChange
            context={context}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            initialStatus={0}
            Title="2. Change status to start proposal registration"
          />
          <ProposalsComponent context={context} currentStatus={currentStatus} />
          <StatusChange
            context={context}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            initialStatus={1}
            Title="4. Change status to end proposal registration"
          />
          <StatusChange
            context={context}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            initialStatus={2}
            Title="5. Change status to start voting session"
          />
          <StatusChange
            context={context}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            initialStatus={3}
            Title="6. Change status to end voting session"
          />
          <StatusChange
            context={context}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            initialStatus={4}
            Title="7. Votes tallied"
          />
        </Container>
      </Fragment>
    );
}

export default App;
