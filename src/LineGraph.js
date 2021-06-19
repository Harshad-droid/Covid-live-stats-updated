import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import numeral from 'numeral';

const casesTypeColors = {
  cases: {
    rgba: "rgba(168, 50, 153, 0.4)",   //"#f06f0c"
    rgb: "rgb(168, 50, 153)"
  },
  recovered: {
    rgba: "rgba(125, 215, 29, 0.4)", //"#7dd71d"
    rgb: "rgb(125, 215, 29)"
  },
  deaths: {
    rgba: "rgba(251, 68, 67, 0.4)", //"#fb4443"
    rgb: "rgba(251, 68, 67)"
  },
};

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};
function LineGraph({ casesType = 'cases', country, ...props }) {
  const [data, setData] = useState({});

  //For plotting graph , we need data in form of [x:y]
  const buildChartData = (data, casesType = 'cases') => {
    const chartData = [];
    let lastDataPoint;
    if (country === 'worldwide') {
      for (let date in data.cases) {
        if (lastDataPoint) {
          const newDataPoint = {
            x: date,
            y: data[casesType][date] - lastDataPoint
          }
          chartData.push(newDataPoint);
        }
        lastDataPoint = data[casesType][date];
      }
    }
    else {
      for (let date in data.timeline.cases) {
        if (lastDataPoint) {
          const newDataPoint = {
            x: date,
            y: data.timeline[casesType][date] - lastDataPoint
          }
          chartData.push(newDataPoint);
        }
        lastDataPoint = data.timeline[casesType][date];
      }
    }
    return chartData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const url = country === 'worldwide' ? 'https://disease.sh/v3/covid-19/historical/all?lastdays=90'
        : `https://disease.sh/v3/covid-19/historical/${country}?lastdays=90`;
      await fetch(url)
        .then(response => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          let chartData = buildChartData(data, casesType);
          setData(chartData);
        });
    };
    fetchData();
  }, [country,casesType]);    
  //condition that updates useEffect when change occurs!! here graph updates for change in country and casesType

  return (
    <div className={props.className}>
      {data?.length > 0 && (       //optional chaining eqv. to data && data.length
        <Line options={options}
          data={{
            datasets: [
              {
                backgroundColor: casesTypeColors[casesType].rgba,
                borderColor: casesTypeColors[casesType].rgb,
                data: data,
              },
            ],
          }} />
      )}
    </div>
  )
}

export default LineGraph;
