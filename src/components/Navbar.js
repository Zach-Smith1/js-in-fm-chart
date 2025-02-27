import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { setActivePage, setTheme, setNavOpen, setLoading } from "../redux/globalSlice";

const Navigation = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data);
  const theme = useSelector((state) => state.theme);
  const open = useSelector((state) => state.navOpen);
  const chosen = useSelector((state) => state.chosen);

  const handleNavigation = (path) => {
    if (data[chosen].length > 1000) dispatch(setLoading(true));
    setTimeout(() => dispatch(setActivePage(path)), 50);
  };

  return (
    <Navbar bg={theme} data-bs-theme={theme} className={`sidebar-nav ${open ? 'open' : 'closed'}`}>
      <Container className="nav flex-column" style={!open ? { paddingRight: '6px' } : {}}>
        <div
          onClick={() => dispatch(setNavOpen(!open))}
          aria-controls="navbar"
          aria-expanded={open}
          style={{
            width: '7px',
            height: '100%',
            backgroundColor: theme === 'light' ? 'white' : 'black',
            cursor: 'pointer',
            position: 'absolute',
            top: 0,
            right: 0
          }}>
        <i className={`fa-xs fa-solid fa-chevron-${open ? 'left' : 'right'}`}
        style={{ width: '100%', cursor: 'pointer', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
        </i>
        </div>
        <div id="navbar" className={`collapse-content ${open ? 'show' : 'hide'}`}>
          <div className="checkbox-wrapper">
            <input
              checked={theme !== "light"}
              className="checkbox"
              id="checkbox"
              onChange={(e) => {
                dispatch(setTheme(e.target.checked ? "dark" : "light"));
                document.documentElement.setAttribute("data-bs-theme", theme);
              }}
              type="checkbox"
            />
            <label className="checkbox-label" htmlFor="checkbox" style={!open ? { width: '31px' } : {}}>
              {open && <><i className="fas fa-moon"></i>
              <i className="fas fa-sun"></i></>}
              {!open ? theme === 'light' ? <i className="fas fa-sun" style={{ right: '4px' }}></i> : <i className="fas fa-moon"></i> : ''}
              {open && <span className="ball"></span>}
            </label>
          </div>
          <Nav className="nav flex-column" style={{ textAlign: open ? 'left' : 'center', width: '100%' }}>
            <Nav.Link as="div" onClick={() => handleNavigation('home')}>
              <i className="fa-solid fa-house"></i>
              <span style={!open ? { display: 'none' } : {}}> Home</span>
            </Nav.Link>
            {!chosen ? (
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="tooltip-disabled">First Select a Data Set to Populate your Table</Tooltip>}
              >
                <span className="d-inline-block">
                  <Nav.Link as="div" disabled style={{ pointerEvents: 'none' }}>
                    <i className="fa-solid fa-table"></i>
                    <span onClick={() => handleNavigation('table')}style={!open ? { display: 'none' } : {}}> My Table</span>
                  </Nav.Link>
                </span>
              </OverlayTrigger>
            ) : (
              <Nav.Link as="div" onClick={() => handleNavigation('table')}>
                <i className="fa-solid fa-table"></i>
                <span style={!open ? { display: 'none' } : {}}> My Table</span>
              </Nav.Link>
            )}
            {!chosen ? (
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="tooltip-disabled">First Select a Data Set to Populate your Chart</Tooltip>}
              >
                <span className="d-inline-block">
                  <Nav.Link as="div" disabled style={{ pointerEvents: 'none' }}>
                    <i className="fa-solid fa-chart-line"></i>
                    <span style={!open ? { display: 'none' } : {}}> My Chart</span>
                  </Nav.Link>
                </span>
              </OverlayTrigger>
            ) : (
              <Nav.Link as="div" onClick={() => handleNavigation('charts')}>
                <i className="fa-solid fa-chart-line"></i>
                <span style={!open ? { display: 'none' } : {}}> My Chart</span>
              </Nav.Link>
            )}
            <Nav.Link as="div" onClick={() => handleNavigation('life')}>
              <i className="fa-solid fa-gamepad"></i>
              <span style={!open ? { display: 'none' } : {}}> My Game</span>
            </Nav.Link>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};

export default Navigation;