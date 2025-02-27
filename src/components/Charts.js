import React, { useEffect,useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import ReactApexChart from 'react-apexcharts';

const Charts = () => {
  const data = useSelector((state) => state.data[state.chosen]);
  const headers = useSelector((state) => state.headers);
  const theme = useSelector((state) => state.theme);
  const [type, setType] = useState('Line');
  const navOpen = useSelector((state) => state.navOpen);
  const [chartSeries, setChartSeries ] = useState([]);
  const [categories, setCategories ] = useState([]);
  const [x, setX] = useState(headers.includes('Apples') ? 'month' : 'Period_Platform');
  const [range, setRange] = useState([0, 1]);
  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    const transformChartData = (data) => {
      // Extract unique periods for x-axis (sorted)
      const categories = [...new Set(data.map(item => item[x]))].sort();
      setRange([categories[0], categories[categories.length - 1]]);

      let filteredHeaders = headers.filter(header => header.includes("Income") || header.includes("Expense") || header.includes("Residual") || header.includes("Commission") || header.includes("Payouts") || header.includes("Net_Income") || header.includes("Agent_Gross") || header.includes("Agent_Payable") || header.includes("Revenue"));

      if (filteredHeaders.length === 0) {
        filteredHeaders = headers.filter(h => !['Period_Platform', 'Period', 'Date', 'month'].includes(h));
      }

      // Aggregate data by period for each header
      const seriesData = filteredHeaders.reduce((acc, header) => {
        acc[header] = categories.map(period => {
          const item = data.find(d => d[x] === period);
          return item ? parseFloat(item[header]) : 0;
        });
        return acc;
      }, {});

      // Format data for the chart
      const chartSeries = filteredHeaders.map(header => ({
        name: header,
        data: seriesData[header]
      }));

      setChartSeries(chartSeries);
      setCategories(categories);
    }
    transformChartData(data);
  }, [x, headers]);

  const chartOptions = {
    colors: ['#FEB019', '#008FFB', '#00E396', '#775DD0', '#FF4560', '#00D9E9', '#FF66C3'],
    chart: {
      background: 'transparent',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      zoom: {
        enabled: true
      },
      toolbar: {
        show: true
      }
    },
    forecastDataPoints: {
      count: 0,
      fillOpacity: 0.1,
      strokeWidth: undefined,
      dashArray: 4,
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: `Financials from ${range[0]} to ${range[1]}`,
      align: 'left'
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: [theme === 'dark' ? '#f3f3f3' : 'grey', 'transparent'],
        opacity: 0.5
      }
    },
    markers: {
      size: 1
    },
    theme: {
      mode: theme
    },
    tooltip: {
      marker: {
        show: false,
    },
    },
    xaxis: {
      hideOverlappingLabels: true,
      // categories: Array.from({ length: daysLastMonth }, (_, i) => ' ' + (currentMonth - 1) + ' / ' + (i + 1)).concat(Array.from({ length: daysThisMonth }, (_, i) => ' ' + currentMonth + ' / ' + (i + 1)))
      categories: categories
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return !!val ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 0;
        }
      },
      min: 0,
      decimalsInFloat: 0,
      title: {
        text: 'Financials'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -15,
      offsetX: -5
    }
};

  return (
    <div className={theme} style={{ display: "flex", flexDirection: "row", width: "100vw" }}>
      <Navbar/>
      {!loading && <div className="main-content">
        <div style={{ width: '100%', marginLeft: !navOpen ? '3%' : '1%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>My Chart</h1>
            <span style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxHeight: '100px' }}>
              <Button onClick={() => {setType(type === 'Line' ? 'Bar' : 'Line')}}>
                Type: {type}
              </Button>
            </span>
          </div>
          <ReactApexChart
            height="500"
            options={chartOptions}
            series={chartSeries}
            type={type.toLowerCase()}
            width={navOpen ? '90%' : '95%'}
            />
            <span>
              {/* <select value={y} onChange={(e) => setY(e.target.value)}>{headers.filter(header => header.includes('Expense') || header.includes('Commission') || header.includes('Gross') || header.includes('Income')).map(header =>
                <option key={header} value={header}>
                  {header}</option>)}
              </select> */}
            </span>
        </div>
      </div>}
      {loading && (
        <div className="loadingBox">
          <h1 className="fa-fade">Loading your Table</h1>
          <br />
          <i className="fa-solid fa-table-cells fa-beat-fade fa-xl"></i>
        </div>
      )}
    </div>
  );
};

export default Charts;