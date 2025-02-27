import React from "react";
// import { Accordion, Button, Dropdown } from "react-bootstrap";
// import Grid from "../Datagrid";
import { useDispatch, useSelector } from "react-redux";
import { setChosen, setHeaders } from "./redux/globalSlice";
import Navbar from "./components/Navbar";
import Grid from "./components/DataGrid";
import Charts from "./components/Charts";
import Life from "./components/Life";
import { toast } from "react-toastify";

const App = () => {
  // const headers = useSelector((state) => state.headers);
  const active = useSelector((state) => state.activePage);
  const theme = useSelector((state) => state.theme);
  const dataSets = useSelector((state) => state.data);
  // const allData = useSelector((state) => state.data);
  const loading = useSelector((state) => state.loading);

  const dispatch = useDispatch();

  document.documentElement.setAttribute("data-bs-theme", theme);

  const getDimensions = (data) => {
    let headers, headerRow;
    if (typeof data === "string") {
      data = data.split("\n");
      headerRow = 0;
      while (data[headerRow].split(",").length < 3) {
        headerRow++;
      }
      headers = data[headerRow].split(",");
    } else {
      headers = Object.keys(data[0]);
    }
    return (<>{(headers.length).toLocaleString()} columns and<br/>{(data.length).toLocaleString()} rows</>);
  };

  const selectData = (name) => {
    let headers;
    if (typeof dataSet === "string") {
      dataSet = dataSets[name].split("\n");
      headerRow = 0;
      while (dataSet[headerRow].split(",").length < 3) {
        headerRow++;
      }
      headers = dataSet[headerRow].split(",");
    } else {
      console.log(dataSets[name]);
      headers = Object.keys(dataSets[name][0]);
    }
    dispatch(setHeaders(headers));
    dispatch(setChosen(name));
    toast.success(`Selected ${name} data set`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100vw" }}>
      <Navbar />
      {active === "home" && !loading && (
        <div
          className={`main-content ${theme}`}
          style={{
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1>Welcome to the Homepage!</h1>
          <h3>Please Select the Data Set you want to explore</h3><br/>
          <div
            style={{ display: "flex", flexWrap: "wrap", alignContent:'start', justifyContent: "space-around", border: `1px solid ${theme === 'dark' ? 'white' : 'black'}`, borderRadius: "10px", padding: "10px", width: "80%", height: "70vh", overflowY: "auto" }}
          >
            {Object.keys(dataSets).map((name, index) => (
              <div
                key={index}
                className="card"
              >
                <div className="card-body" onClick={() => selectData(name)} title='Click to select this data set'>
                  <h1 className="card-title">{name}</h1>
                  <p style={{ fontSize: "0.8rem" }}>
                    {getDimensions(dataSets[name])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {active === "home" && loading && (
        <div className="loadingBox">
          <h1 className="fa-fade">Loading your Table</h1>
          <br />
          <i className="fa-solid fa-table-cells fa-beat-fade fa-xl"></i>
        </div>
      )}
      {active === "table" &&
        <Grid />}
      {active === "charts" &&
        <Charts />}
      {active === "life" &&
        <Life />}
    </div>
  );
};

export default App;