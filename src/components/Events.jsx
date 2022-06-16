import React, { useEffect, useState } from "react";
import {
  Navbar,
  Form,
  Container,
  Card,
  Row,
  Modal,
  Spinner,
  Image,
} from "react-bootstrap";
import { format } from "date-fns";
import "../events.css";
import Badge from "@material-ui/core/Badge";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NightlifeRoundedIcon from "@mui/icons-material/NightlifeRounded";

export default function Events() {
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [show, setShow] = useState(false);
  const [eventData, setEventData] = useState();
  const [allData, setAllData] = useState();
  const [dateTop, setDateTop] = useState(undefined);
  const [itemCount, setItemCount] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents();

    setTimeout(function () {
      const dateElement = document
        .querySelector(".eventDate")
        .getBoundingClientRect();
      setDateTop(dateElement.top);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            const dateElement = document.querySelector(".eventDate");
            const newDateTop = format(
              new Date(entry.target.getAttribute("date")),
              "eee MMM d y"
            );
            dateElement.innerHTML = newDateTop;
          }
        });
      });
      const allChangeDateCards = document.querySelectorAll(".changeDate");
      allChangeDateCards.forEach((el) => {
        observer.observe(el);
      });
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!dateTop) return;
    window.addEventListener("scroll", isSticky);
    return () => {
      window.removeEventListener("scroll", isSticky);
    };
  }, [dateTop]);

  const isSticky = (e) => {
    const scrollTop = window.scrollY;
    const dateElement = document.querySelector(".eventDate");
    if (scrollTop >= dateTop - 150) {
      dateElement.classList.add("is-sticky");
    } else {
      dateElement.classList.remove("is-sticky");
    }
  };

  const getEvents = async () => {
    try {
      let response = await fetch(
        "https://tlv-events-app.herokuapp.com/events/uk/london",
        {
          method: "GET",
        }
      );
      if (response.ok) {
        let data = await response.json();
        setEventData(data);
        setAllData(data);
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log("Error");
    }
  };
  eventData?.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  const newTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (query.length < 1) {
      setEventData(allData);
    } else if (query.length >= 1) {
      setEventData(
        eventData?.filter((el) =>
          el.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query]);

  return (
    <div>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Form className="search">
            <Form.Control
              size="lg"
              type="text"
              placeholder="Search here... "
              id="smallsearch"
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
          </Form>
          <Badge
            color="secondary"
            badgeContent={itemCount}
            className="badge"
            onClick={handleShow}
          >
            <ShoppingCartIcon className="cart-icon" />
          </Badge>
        </Container>
      </Navbar>
      <Container>
        <div className="header">Public Events</div>
        {loading && <Spinner animation="border" variant="primary" />}

        <Row>
          {eventData?.map((ev, i, arr) => {
            const prevEvent = arr[i - 1];
            if (
              Math.ceil(
                Math.abs(new Date(ev.date) - new Date(prevEvent?.date)) /
                  (1000 * 60 * 60 * 24)
              ) === 0
            ) {
              return (
                <Card style={{ width: "20rem" }} key={i} className="card">
                  <div className="title-container">
                    <div className="icon-container">
                      <NightlifeRoundedIcon className="card-icon" />
                    </div>
                    <div className="title mx-2">{ev.title} </div>
                  </div>
                  <Card.Body>
                    <Card.Img
                      variant="top"
                      src={ev.flyerFront}
                      className="card-image"
                    />
                    <div className="card-bottom">
                      <div
                        className="locaction-text"
                        onClick={() => newTab(ev.venue.direction)}
                      >
                        <LocationOnIcon className="card-icon" /> {ev.venue.name}{" "}
                      </div>
                      <AddCircleIcon
                        className="add-icon"
                        onClick={() => {
                          setSelectedEvents((selectedEvents) => [
                            ...selectedEvents,
                            ev,
                          ]);
                          setItemCount(itemCount + 1);
                          eventData.splice(i, 1);
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              );
            } else {
              return (
                <>
                  <div className="eventDate">
                    {format(new Date(ev.date), "eee MMM d y")}
                  </div>
                  <Card style={{ width: "20rem" }} key={i} className="card">
                    <div className="title-container">
                      <div className="icon-container">
                        <NightlifeRoundedIcon className="card-icon" />
                      </div>
                      <div className="title">{ev.title} </div>
                    </div>
                    <Card.Body>
                      <Card.Img
                        variant="top"
                        src={ev.flyerFront}
                        className="card-image"
                      />
                      <div className="card-bottom">
                        <div
                          className="locaction-text"
                          onClick={() => newTab(ev.venue.direction)}
                        >
                          <LocationOnIcon className="card-icon" />{" "}
                          {ev.venue.name}{" "}
                        </div>
                        <AddCircleIcon
                          variant="primary"
                          className="changeDate add-icon"
                          date={ev.date}
                          onClick={() => {
                            setSelectedEvents((selEvts) => [...selEvts, ev]);
                            setItemCount(itemCount + 1);
                            eventData.splice(i, 1);
                            console.log("SELECTED EVENTS", selectedEvents);
                          }}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </>
              );
            }
          })}
        </Row>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Your Events</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            {selectedEvents?.map((sE, i) => {
              return (
                <div className="modal-container" key={i}>
                  <div>
                    <Image src={sE.flyerFront} className="modal-img" />
                  </div>
                  <div className="modal-text">{sE.title} </div>
                  <div className="modal-icon">
                    <RemoveCircleIcon
                      onClick={() => {
                        setEventData((evData) => [...evData, sE]);
                        selectedEvents.splice(i, 1);
                        setItemCount(itemCount - 1);
                        if (selectedEvents.length === 0) {
                          handleClose();
                        }
                      }}
                    />
                  </div>
                  <hr className="modal-horizontal" />
                </div>
              );
            })}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
