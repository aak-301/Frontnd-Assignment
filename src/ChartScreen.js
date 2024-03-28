import React, { useState, useEffect } from "react";

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { MimicMetrics } from "./api-mimic";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MetricChart = ({ title, metricData, fill = false }) => {
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const navigate = useNavigate();

  const handleSelectionComplete = () => {
    if (selectionStart && selectionEnd) {
      // Navigate to logs screen with selected time range
      navigate(`/logs?start=${selectionStart}&end=${selectionEnd}`);
    }
  };

  const renderChart = () => {
    if (!metricData) return null;

    const chartData = {
      labels: metricData[0].values.map((value) =>
        new Date(value.timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        })
      ),
      datasets: metricData.map((line) => ({
        label: line.name,
        data: line.values.map((value) => value.value),
        borderColor:
          line.name === "Limits"
            ? "green"
            : line.name === "Requested" || line.name === "Read"
            ? "blue"
            : "red",
        fill: { fill },
      })),
    };

    const options = {
      scales: {
        x: {
          type: "time",
          position: "bottom",
          time: {
            parser: "HH:mm",
            tooltipFormat: "HH:mm",
            unit: "hour",
            displayFormats: {
              hour: "HH:mm",
            },
          },
        },
        y: {
          type: "linear",
          position: "right",
        },
      },
      onClick: (evt, elements) => {
        if (elements && elements.length > 0 && elements[0]) {
          const timestamp = metricData[0].values[elements[0].index].timestamp;
          if (!selectionStart) {
            setSelectionStart(timestamp);
          } else {
            setSelectionEnd(timestamp);
            handleSelectionComplete();
          }
        }
      },
    };

    return <Line data={chartData} options={options} />;
  };

  return (
    <div className="metric-chart">
      {renderChart()}
      <h2>{title}</h2>
    </div>
  );
};

const MetricsScreen = () => {
  const [cpuData, setCpuData] = useState(null);
  const [memoryData, setMemoryData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [diskIopsData, setDiskIopsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metrics = await MimicMetrics.fetchMetrics({
          startTs: Date.now() - 3600 * 1000, // Fetch data for the last hour
          endTs: Date.now(),
        });
        setCpuData(
          metrics.find((metric) => metric.name === "CPU Usage").graphLines
        );
        setMemoryData(
          metrics.find((metric) => metric.name === "Memory Usage").graphLines
        );
        setNetworkData(
          metrics.find((metric) => metric.name === "Network Usage").graphLines
        );
        setDiskIopsData(
          metrics.find((metric) => metric.name === "Disk IOPS").graphLines
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Fetch data at regular intervals
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <MetricChart title="CPU Usage" metricData={cpuData} />
      <MetricChart title="Memory Usage" metricData={memoryData} />
      <MetricChart title="Network Usage" metricData={networkData} />
      <MetricChart title="Disk IOPS" metricData={diskIopsData} fill={true} />
    </div>
  );
};

export default MetricsScreen;
