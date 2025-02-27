(function () {
  console.log("Script loaded in Web Viewer");

  const container = document.getElementById("root");
  if (!container) {
    console.error("React root element #root not found");
    return;
  }

  // Redux store
  const initialState = {
    data: {},
    activePage: "home",
    theme: "light",
    loading: false,
    headers: [],
    chosen: null,
    navOpen: false,
    alerts: []
  };
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_DATA': return { ...state, data: action.payload };
      case 'SET_HEADERS': return { ...state, headers: action.payload };
      case 'SET_CHOSEN': return { ...state, chosen: action.payload };
      case 'SET_ACTIVE_PAGE': return { ...state, activePage: action.payload };
      case 'SET_THEME': return { ...state, theme: action.payload };
      case 'SET_NAV_OPEN': return { ...state, navOpen: action.payload };
      case 'SET_LOADING': return { ...state, loading: action.payload };
      case 'ADD_ALERT': return { ...state, alerts: [...state.alerts, action.payload] };
      case 'REMOVE_ALERT': return { ...state, alerts: state.alerts.filter((_, i) => i !== action.payload) };
      default: return state;
    }
  };
  const store = Redux.createStore(reducer);

  // Navigation component
  const Navigation = () => {
    console.log("Rendering Navigation");

    const dispatch = ReactRedux.useDispatch();
    const data = ReactRedux.useSelector(state => state.data);
    const theme = ReactRedux.useSelector(state => state.theme);
    const open = ReactRedux.useSelector(state => state.navOpen);
    const chosen = ReactRedux.useSelector(state => state.chosen);

    const handleNavigation = (path) => {
      if (data[chosen] && data[chosen].length > 1000) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      setTimeout(() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: path }), 50);
    };

    return React.createElement(ReactBootstrap.Navbar, {
      bg: theme,
      'data-bs-theme': theme,
      className: `sidebar-nav ${open ? 'open' : 'closed'}`
    },
      React.createElement(ReactBootstrap.Container, { className: "nav flex-column", style: !open ? { paddingRight: '6px' } : {} },
        React.createElement("div", {
          onClick: () => dispatch({ type: 'SET_NAV_OPEN', payload: !open }),
          'aria-controls': "navbar",
          'aria-expanded': open,
          style: {
            width: '7px',
            height: '100%',
            backgroundColor: theme === 'light' ? 'white' : 'black',
            cursor: 'pointer',
            position: 'absolute',
            top: 0,
            right: 0
          }
        },
          React.createElement("i", {
            className: `fa-xs fa-solid fa-chevron-${open ? 'left' : 'right'}`,
            style: { width: '100%', cursor: 'pointer', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }
          })
        ),
        React.createElement("div", { id: "navbar", className: `collapse-content ${open ? 'show' : 'hide'}` },
          React.createElement("div", { className: "checkbox-wrapper" },
            React.createElement("input", {
              checked: theme !== "light",
              className: "checkbox",
              id: "checkbox",
              onChange: (e) => {
                const newTheme = e.target.checked ? "dark" : "light";
                dispatch({ type: 'SET_THEME', payload: newTheme });
                document.documentElement.setAttribute("data-bs-theme", newTheme);
              },
              type: "checkbox"
            }),
            React.createElement("label", { className: "checkbox-label", htmlFor: "checkbox", style: !open ? { width: '31px' } : {} },
              open && React.createElement(React.Fragment, null,
                React.createElement("i", { className: "fas fa-moon" }),
                React.createElement("i", { className: "fas fa-sun" })
              ),
              !open && (theme === 'light' ?
                React.createElement("i", { className: "fas fa-sun", style: { right: '4px' } }) :
                React.createElement("i", { className: "fas fa-moon" })),
              open && React.createElement("span", { className: "ball" })
            )
          ),
          React.createElement(ReactBootstrap.Nav, { className: "nav flex-column", style: { textAlign: open ? 'left' : 'center', width: '100%' } },
            React.createElement(ReactBootstrap.Nav.Link, { as: "div", onClick: () => handleNavigation('home') },
              React.createElement("i", { className: "fa-solid fa-house" }),
              React.createElement("span", { style: !open ? { display: 'none' } : {} }, " Home")
            ),
            !chosen ?
              React.createElement(ReactBootstrap.OverlayTrigger, {
                placement: "right",
                overlay: React.createElement(ReactBootstrap.Tooltip, { id: "tooltip-disabled" }, "First Select a Data Set to Populate your Table")
              },
                React.createElement("span", { className: "d-inline-block" },
                  React.createElement(ReactBootstrap.Nav.Link, {
                    as: "div",
                    disabled: true,
                    style: { pointerEvents: 'none', opacity: 0.5 }
                  },
                    React.createElement("i", { className: "fa-solid fa-table" }),
                    React.createElement("span", { style: !open ? { display: 'none' } : {} }, " My Table")
                  )
                )
              ) :
              React.createElement(ReactBootstrap.Nav.Link, { as: "div", onClick: () => handleNavigation('table') },
                React.createElement("i", { className: "fa-solid fa-table" }),
                React.createElement("span", { style: !open ? { display: 'none' } : {} }, " My Table")
              ),
            !chosen ?
              React.createElement(ReactBootstrap.OverlayTrigger, {
                placement: "right",
                overlay: React.createElement(ReactBootstrap.Tooltip, { id: "tooltip-disabled" }, "First Select a Data Set to Populate your Chart")
              },
                React.createElement("span", { className: "d-inline-block" },
                  React.createElement(ReactBootstrap.Nav.Link, {
                    as: "div",
                    disabled: true,
                    style: { pointerEvents: 'none', opacity: 0.5 }
                  },
                    React.createElement("i", { className: "fa-solid fa-chart-line" }),
                    React.createElement("span", { style: !open ? { display: 'none' } : {} }, " My Chart")
                  )
                )
              ) :
              React.createElement(ReactBootstrap.Nav.Link, { as: "div", onClick: () => handleNavigation('charts') },
                React.createElement("i", { className: "fa-solid fa-chart-line" }),
                React.createElement("span", { style: !open ? { display: 'none' } : {} }, " My Chart")
              ),
            React.createElement(ReactBootstrap.Nav.Link, { as: "div", onClick: () => handleNavigation('life') },
              React.createElement("i", { className: "fa-solid fa-gamepad" }),
              React.createElement("span", { style: !open ? { display: 'none' } : {} }, " My Game")
            )
          )
        )
      )
    );
  };

  // Charts component
  const Charts = () => {
    console.log("Rendering Charts");

    const data = ReactRedux.useSelector(state => state.data[state.chosen]);
    const headers = ReactRedux.useSelector(state => state.headers);
    const theme = ReactRedux.useSelector(state => state.theme);
    const navOpen = ReactRedux.useSelector(state => state.navOpen);
    const loading = ReactRedux.useSelector(state => state.loading);

    const [type, setType] = React.useState('Line');
    const [chartSeries, setChartSeries] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [x, setX] = React.useState(headers.includes('Apples') ? 'month' : 'Period_Platform');
    const [range, setRange] = React.useState([0, 1]);

    React.useEffect(() => {
      const transformChartData = (data) => {
        const categories = [...new Set(data.map(item => item[x]))].sort();
        setRange([categories[0], categories[categories.length - 1]]);

        let filteredHeaders = headers.filter(header =>
          header.includes("Income") || header.includes("Expense") ||
          header.includes("Residual") || header.includes("Commission") ||
          header.includes("Payouts") || header.includes("Net_Income") ||
          header.includes("Agent_Gross") || header.includes("Agent_Payable") ||
          header.includes("Revenue")
        );

        if (filteredHeaders.length === 0) {
          filteredHeaders = headers.filter(h => !['Period_Platform', 'Period', 'Date', 'month'].includes(h));
        }

        const seriesData = filteredHeaders.reduce((acc, header) => {
          acc[header] = categories.map(period => {
            const item = data.find(d => d[x] === period);
            return item ? parseFloat(item[header] || 0) : 0;
          });
          return acc;
        }, {});

        const chartSeries = filteredHeaders.map(header => ({
          name: header,
          data: seriesData[header]
        }));

        setChartSeries(chartSeries);
        setCategories(categories);
      };
      if (data) transformChartData(data);
    }, [x, headers, data]);

    const chartOptions = {
      colors: ['#FEB019', '#008FFB', '#00E396', '#775DD0', '#FF4560', '#00D9E9', '#FF66C3'],
      chart: {
        background: 'transparent',
        dropShadow: { enabled: true, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2 },
        zoom: { enabled: true },
        toolbar: { show: true }
      },
      forecastDataPoints: { count: 0, fillOpacity: 0.1, strokeWidth: undefined, dashArray: 4 },
      stroke: { curve: 'smooth' },
      title: { text: `Financials from ${range[0]} to ${range[1]}`, align: 'left' },
      grid: { borderColor: '#e7e7e7', row: { colors: [theme === 'dark' ? '#f3f3f3' : 'grey', 'transparent'], opacity: 0.5 } },
      markers: { size: 1 },
      theme: { mode: theme },
      tooltip: { marker: { show: false } },
      xaxis: { hideOverlappingLabels: true, categories: categories },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 0;
          }
        },
        min: 0,
        decimalsInFloat: 0,
        title: { text: 'Financials' }
      },
      legend: { position: 'top', horizontalAlign: 'right', floating: true, offsetY: -15, offsetX: -5 }
    };

    return React.createElement("div", { className: theme, style: { display: "flex", flexDirection: "row", width: "100vw" } },
      React.createElement(Navigation),
      !loading && React.createElement("div", { className: "main-content" },
        React.createElement("div", { style: { width: '100%', marginLeft: !navOpen ? '3%' : '1%' } },
          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
            React.createElement("h1", null, "My Chart"),
            React.createElement("span", { style: { display: 'flex', justifyContent: 'space-around', width: '100%', maxHeight: '100px' } },
              React.createElement(ReactBootstrap.Button, {
                onClick: () => setType(type === 'Line' ? 'Bar' : 'Line')
              }, "Type: ", type)
            )
          ),
          React.createElement(ReactApexChart, {
            height: "500",
            options: chartOptions,
            series: chartSeries,
            type: type.toLowerCase(),
            width: navOpen ? '90%' : '95%'
          })
        )
      ),
      loading && React.createElement("div", { className: "loadingBox" },
        React.createElement("h1", { className: "fa-fade" }, "Loading your Table"),
        React.createElement("br"),
        React.createElement("i", { className: "fa-solid fa-table-cells fa-beat-fade fa-xl" })
      )
    );
  };

  // Datagrid component with MUI DataGrid
  const Datagrid = () => {
    console.log("Rendering Datagrid");

    const allData = ReactRedux.useSelector(state => state.data);
    const chosen = ReactRedux.useSelector(state => state.chosen);
    const theme = ReactRedux.useSelector(state => state.theme);
    const navOpen = ReactRedux.useSelector(state => state.navOpen);
    const dispatch = ReactRedux.useDispatch();

    const [rows, setRows] = React.useState([]);
    const [columns, setColumns] = React.useState([]);

    React.useEffect(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
      let headers, headerRow;

      let dataSet = allData[chosen];
      if (!dataSet) return;

      if (typeof dataSet === "string") {
        dataSet = dataSet.split("\n");
        headerRow = 0;
        while (dataSet[headerRow].split(",").length < 3) {
          headerRow++;
        }
        headers = dataSet[headerRow].split(",");
      } else {
        headers = Object.keys(dataSet[0]);
      }

      const cols = headers.map(header => {
        if (header.toLowerCase().includes("date")) {
          return {
            align: "center",
            aggregable: false,
            field: header.trim(),
            headerAlign: "center",
            headerName: header.trim(),
            width: 150,
            renderCell: (params) =>
              React.createElement("div", null,
                params.value ? new Date(params.value).toLocaleDateString() : ""
              )
          };
        } else if (header.includes("Income") || header.includes("Expense") || header.includes("Residual") ||
                   header.includes("Commission") || header.includes("Payouts") || header.includes("Net_Income") ||
                   header.includes("Agent_Gross") || header.includes("Agent_Payable") || header.includes("Revenue")) {
          return {
            align: "center",
            field: header.trim(),
            headerAlign: "center",
            headerName: header.trim(),
            width: 160,
            type: "number",
            renderCell: (params) =>
              React.createElement("div", null,
                params.value ? `$${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""
              )
          };
        } else {
          return {
            align: "center",
            field: header.trim(),
            headerAlign: "center",
            headerName: header.trim(),
            width: 120
          };
        }
      });

      let rowsData;
      if (typeof dataSet[0] !== "string") {
        rowsData = dataSet.map((item, i) => ({
          id: i,
          ...Object.keys(item).reduce((acc, key) => {
            acc[key] = item[key];
            return acc;
          }, {})
        }));
      } else {
        rowsData = dataSet.slice(headerRow + 1).map((row, i) => {
          const values = row.split(",");
          if (!values[0]) return null;
          const rowData = { id: i };
          headers.forEach((header, index) => {
            if (header === "Date Approved") {
              rowData[header.trim()] = values[index] ? new Date(values[index].trim()) : "";
            } else if (header.trim() === "Income" || header.trim() === "Expense" || header.trim() === "Residual") {
              rowData[header.trim()] = !isNaN(Number(values[index])) ? parseFloat(values[index].trim()) : 0;
            } else {
              rowData[header.trim()] = values[index] ? values[index].trim() : "";
            }
          });
          return rowData;
        }).filter(row => row !== null);
      }

      dispatch({ type: 'SET_HEADERS', payload: headers });
      setColumns(cols);
      setRows(rowsData);
    }, [chosen]);

    const CustomToolbar = () => React.createElement("div", { className: "MuiDataGrid-toolbar" },
      React.createElement("input", { type: "text", placeholder: "Quick filter..." }),
      React.createElement(ReactBootstrap.Button, null, "Columns"),
      React.createElement(ReactBootstrap.Button, null, "Filters"),
      React.createElement(ReactBootstrap.Button, null, "Density")
    );

    return React.createElement("div", { className: theme, style: { display: "flex", flexDirection: "row", alignItems: "center", width: "100vw" } },
      React.createElement(Navigation),
      React.createElement("div", { className: "main-content", style: { height: '97vh', width: navOpen ? '99%' : '95vw', maxWidth: '88vw', marginTop: '1%', marginLeft: '1%', marginRight: '2%' } },
        React.createElement(MUIDataGrid.DataGrid, {
          rows: rows,
          columns: columns,
          checkboxSelection: false,
          disableRowSelectionOnClick: true,
          pagination: true,
          pageSizeOptions: [10, 25, 50, 100, 1000],
          initialState: {
            pagination: { paginationModel: { pageSize: 25 } },
            density: "standard"
          },
          slots: { toolbar: CustomToolbar },
          sx: {
            '.MuiDataGrid-root': { border: '2px solid', color: theme === 'dark' ? 'white' : 'black', backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white' },
            '.MuiDataGrid-columnHeader': { backgroundColor: theme === 'dark' ? 'black' : 'lightgrey' },
            '.MuiDataGrid-cell': { backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white' }
          }
        })
      )
    );
  };

  // Life component
  const Life = () => {
    console.log("Rendering Life");

    const theme = ReactRedux.useSelector(state => state.theme);
    const navOpen = ReactRedux.useSelector(state => state.navOpen);

    const [boxSize, setBoxSize] = React.useState(10);
    const [boxCount, setBoxCount] = React.useState(55);
    const [rowCount, setRowCount] = React.useState(55);
    const [matrix, setMatrix] = React.useState([]);
    const [lastTick, setLastTick] = React.useState(1000);
    const [tick, setTick] = React.useState(2147000000);
    const [isMouseDown, setIsMouseDown] = React.useState(false);
    const [paused, setPaused] = React.useState(true);
    const [toggle, setToggle] = React.useState('transparent');
    const [gens, setGens] = React.useState(0);
    const [liveCount, setLiveCount] = React.useState(0);

    React.useEffect(() => {
      setTimeout(() => {
        const fadeCover = document.getElementsByClassName('fade-cover')[0];
        if (fadeCover) fadeCover.classList.add('fade-out');
      }, 100);

      const updateLayout = () => {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        let windowHeight = window.innerHeight;
        let windowWidth = window.innerWidth;
        let bs = boxSize || Math.max(screenWidth, screenHeight) * 0.005;
        if (screenWidth < 900 || screenHeight < 900) bs *= 2;
        const newBoxCount = Math.floor(Math.min(windowWidth, screenWidth) / bs);
        const newRowCount = Math.floor(Math.min(windowHeight, screenHeight) / bs);
        setBoxSize(bs);
        setBoxCount(newBoxCount * 3);
        setRowCount(newRowCount * 3);
      };

      window.addEventListener('resize', updateLayout);
      updateLayout();

      return () => window.removeEventListener('resize', updateLayout);
    }, []);

    const newMatrix = () => {
      console.log('making fresh matrix....');
      setMatrix(Array.from({ length: rowCount }).map(() =>
        Array.from({ length: boxCount }).fill(0)
      ));
      setLiveCount(0);
    };

    React.useEffect(() => {
      if (boxSize === 10) newMatrix();
    }, [rowCount, boxCount]);

    const handleClick = (rowIndex, colIndex) => {
      if (matrix[rowIndex][colIndex] === 0) {
        setLiveCount(liveCount + 1);
      }
      setMatrix(prevMatrix =>
        prevMatrix.map((row, rIndex) =>
          row.map((cell, cIndex) =>
            rIndex === rowIndex && cIndex === colIndex ? 1 : cell
          )
        )
      );
    };

    const nextGen = () => {
      const m = matrix;
      let newMatrix = Array.from({ length: rowCount }, () => []);
      let l = liveCount;

      const cellUpdate = (r, c) => {
        let neighbors = 0;
        neighbors += (r > 0 && c > 0) ? m[r - 1][c - 1] : 0;
        neighbors += (r > 0) ? m[r - 1][c] : 0;
        neighbors += (r > 0 && c < m[0].length - 1) ? m[r - 1][c + 1] : 0;
        neighbors += (c > 0) ? m[r][c - 1] : 0;
        neighbors += (c < m[0].length - 1) ? m[r][c + 1] : 0;
        neighbors += (r < m.length - 1 && c > 0) ? m[r + 1][c - 1] : 0;
        neighbors += (r < m.length - 1) ? m[r + 1][c] : 0;
        neighbors += (r < m.length - 1 && c < m[0].length - 1) ? m[r + 1][c + 1] : 0;

        if (m[r][c] === 0) {
          return neighbors === 3 ? [1, 1] : [0, 0];
        }
        if (m[r][c] === 1 && (neighbors > 3 || neighbors < 2)) {
          return [0, -1];
        }
        return [1, 0];
      };

      for (let row = 0; row < rowCount; row++) {
        newMatrix[row] = [];
        for (let col = 0; col < boxCount; col++) {
          let cell = cellUpdate(row, col);
          l += cell[1];
          newMatrix[row].push(cell[0]);
        }
      }

      setMatrix(newMatrix);
      setLiveCount(l);
      setGens(gens + 1);
    };

    const speedUp = () => {
      if (lastTick <= 5) return;
      const t = lastTick <= 50 ? lastTick - 5 : lastTick <= 100 ? lastTick - 10 : lastTick - 100;
      setLastTick(t);
      if (!paused) setTick(t);
    };

    const slowDown = () => {
      const t = lastTick < 50 ? lastTick + 5 : lastTick < 100 ? lastTick + 10 : lastTick + 100;
      setLastTick(t);
      if (!paused) setTick(t);
    };

    const pause = () => {
      if (!paused) {
        setLastTick(tick);
        setTick(2147000000);
      } else {
        setTick(lastTick);
      }
      setPaused(!paused);
    };

    const clear = () => {
      if (tick < 2147000000) {
        setLastTick(tick);
        setTick(2147000000);
      }
      if (!paused) setPaused(true);
      if (gens > 0) setGens(0);
      if (liveCount !== 0) newMatrix();
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseMove = (rowIndex, colIndex) => { if (isMouseDown) handleClick(rowIndex, colIndex); };
    const handleTouchStart = () => setIsMouseDown(true);
    const handleTouchEnd = () => setIsMouseDown(false);
    const handleTouchMove = (event, rowIndex, colIndex) => {
      const touch = event.touches[0];
      let x = Math.floor(touch.clientX / boxSize);
      let y = Math.floor(touch.clientY / boxSize);
      if (isMouseDown) handleClick(y, x);
    };

    const toggleGrid = () => setToggle(toggle === 'transparent' ? 'grey' : 'transparent');
    const boxSizeUp = () => setBoxSize(boxSize * 1.5);
    const boxSizeDown = () => setBoxSize(boxSize * 0.75);

    React.useEffect(() => {
      const intervalId = setInterval(nextGen, tick);
      return () => clearInterval(intervalId);
    }, [tick, matrix]);

    return React.createElement("div", { className: theme, style: { display: "flex", flexDirection: "row", width: "100vw" } },
      React.createElement(Navigation),
      React.createElement("div", { className: "main-content" },
        React.createElement("div", {
          className: 'gridLife',
          style: { marginLeft: navOpen ? '5%' : '8%' },
          onMouseDown: handleMouseDown,
          onMouseUp: handleMouseUp,
          onTouchStart: handleTouchStart,
          onTouchEnd: handleTouchEnd
        },
          React.createElement("div", { className: "fade-cover" }),
          matrix.map((row, rowIndex) =>
            rowIndex >= (rowCount / 3) && rowIndex <= (rowCount / 3 * 2) &&
            React.createElement("div", { key: rowIndex, style: { display: 'flex' } },
              row.map((cell, colIndex) =>
                colIndex >= (boxCount / 3) && colIndex <= (boxCount / 3 * 2) &&
                React.createElement("div", {
                  key: colIndex,
                  style: {
                    width: boxSize + 'px',
                    height: boxSize + 'px',
                    backgroundColor: cell === 0 ? (theme === 'light' ? 'white' : 'black') : (theme === 'light' ? 'black' : 'white'),
                    boxSizing: 'border-box',
                    border: `.1px solid ${toggle}`
                  },
                  onClick: () => handleClick(rowIndex, colIndex),
                  onMouseMove: () => handleMouseMove(rowIndex, colIndex),
                  onTouchMove: () => handleTouchMove(event, rowIndex, colIndex)
                })
              )
            )
          ),
          React.createElement("div", { className: 'controls' },
            React.createElement("div", { style: { flex: 1, flexDirection: 'row', display: 'flex', justifyContent: 'space-around' } },
              React.createElement(ReactBootstrap.Button, { onClick: clear }, "Clear"),
              React.createElement(ReactBootstrap.Button, { onClick: nextGen }, "+1 Gen"),
              React.createElement(ReactBootstrap.Button, { onClick: speedUp }, "▲"),
              React.createElement(ReactBootstrap.Button, { onClick: slowDown }, "▼"),
              React.createElement(ReactBootstrap.Button, { id: `arrowButton${paused}`, onClick: pause }, ">||"),
              React.createElement(ReactBootstrap.Button, { onClick: toggleGrid }, "#"),
              React.createElement(ReactBootstrap.Button, { onClick: boxSizeUp }, "b^"),
              React.createElement(ReactBootstrap.Button, { onClick: boxSizeDown }, "bv")
            ),
            React.createElement("div", { className: 'info' },
              React.createElement("span", null, "Generations: ", gens),
              React.createElement("span", null, "Live Cells: ", liveCount),
              "Speed: ", `${Math.round((1000/lastTick)*100)/100} gen/sec`
            )
          )
        )
      )
    );
  };

  // App component
  const App = () => {
    console.log("Rendering App");

    const dispatch = ReactRedux.useDispatch();
    const active = ReactRedux.useSelector(state => state.activePage);
    const theme = ReactRedux.useSelector(state => state.theme);
    const dataSets = ReactRedux.useSelector(state => state.data);
    const loading = ReactRedux.useSelector(state => state.loading);
    const alerts = ReactRedux.useSelector(state => state.alerts);

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
      return React.createElement("span", null,
        headers.length.toLocaleString(), " columns and",
        React.createElement("br"),
        data.length.toLocaleString(), " rows"
      );
    };

    const selectData = (name) => {
      let headers, dataSet = dataSets[name];
      if (typeof dataSet === "string") {
        dataSet = dataSet.split("\n");
        let headerRow = 0;
        while (dataSet[headerRow].split(",").length < 3) {
          headerRow++;
        }
        headers = dataSet[headerRow].split(",");
      } else {
        console.log(dataSets[name]);
        headers = Object.keys(dataSet[0]);
      }
      dispatch({ type: 'SET_HEADERS', payload: headers });
      dispatch({ type: 'SET_CHOSEN', payload: name });
      dispatch({
        type: 'ADD_ALERT',
        payload: { variant: 'success', message: `Selected ${name} data set` }
      });
      setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: 0 }), 5000);
    };

    return React.createElement("div", { style: { display: "flex", flexDirection: "row", width: "100vw" } },
      React.createElement(Navigation),
      React.createElement("div", { style: { flex: 1, position: "relative" } },
        alerts.length > 0 && React.createElement("div", {
          style: { position: "fixed", top: "10px", right: "10px", zIndex: 1000 }
        },
          alerts.map((alert, index) =>
            React.createElement(ReactBootstrap.Alert, {
              key: index,
              variant: alert.variant,
              onClose: () => dispatch({ type: 'REMOVE_ALERT', payload: index }),
              dismissible: true
            }, alert.message)
          )
        ),
        active === "home" && !loading && React.createElement("div", {
          className: `main-content ${theme}`,
          style: {
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }
        },
          React.createElement("h1", null, "Welcome to the Homepage!"),
          React.createElement("h3", null, "Please Select the Data Set you want to explore"),
          React.createElement("br"),
          React.createElement("div", {
            style: {
              display: "flex",
              flexWrap: "wrap",
              alignContent: "start",
              justifyContent: "space-around",
              border: `1px solid ${theme === 'dark' ? 'white' : 'black'}`,
              borderRadius: "10px",
              padding: "10px",
              width: "80%",
              height: "70vh",
              overflowY: "auto"
            }
          },
            Object.keys(dataSets).map((name, index) =>
              React.createElement("div", {
                key: index,
                className: "card"
              },
                React.createElement("div", {
                  className: "card-body",
                  onClick: () => selectData(name),
                  title: "Click to select this data set"
                },
                  React.createElement("h1", { className: "card-title" }, name),
                  React.createElement("p", { style: { fontSize: "0.8rem" } }, getDimensions(dataSets[name]))
                )
              )
            )
          )
        ),
        active === "home" && loading && React.createElement("div", { className: "loadingBox" },
          React.createElement("h1", { className: "fa-fade" }, "Loading your Table"),
          React.createElement("br"),
          React.createElement("i", { className: "fa-solid fa-table-cells fa-beat-fade fa-xl" })
        ),
        active === "table" && React.createElement(Datagrid),
        active === "charts" && React.createElement(Charts),
        active === "life" && React.createElement(Life)
      )
    );
  };

  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(ReactRedux.Provider, { store: store },
      React.createElement(App)
    )
  );

  window.loadApp = (data) => {
    console.log("loadApp called with:", data);
    try {
      const obj = JSON.parse(data);
      const currentState = store.getState();
      const knownData = { ...currentState.data, fruit: obj["data"] };
      store.dispatch({ type: 'SET_DATA', payload: knownData });
    } catch (error) {
      console.error("Failed to parse data in loadApp:", error);
    }
  };

  console.log("loadApp defined");
})();