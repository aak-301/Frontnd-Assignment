import React, { useState, useEffect, useRef } from "react";
import { MimicLogs } from "./api-mimic"; // Assuming MimicLogs is imported from another file
import { useParams } from "react-router-dom";

import "./App.css";
import { useSearchParams } from "react-router-dom";

function LogScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0); // State to track the count of logs being loaded
  const logContainerRef = useRef(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("Last 5 minutes");
  const { start, end } = useParams();
  // Convert start and end time strings to Date objects if needed
  const startTime = new Date(parseInt(start));
  const endTime = new Date(parseInt(end));

  console.log("time:", start, end);
  const [startGraphTime, setstartGraphTime] = useState(
    new Date(parseInt(start)) || null
  );
  const [endGraphTime, setendGraphTime] = useState(
    new Date(parseInt(end)) || null
  );


  useEffect(() => {
    // Add CSS class to hide scrollbar
    document.body.classList.add("no-scroll");

    // Fetch logs when the component mounts
    fetchLogs(selectedTimeRange);

    // Subscribe to live logs
    const unsubscribeLiveLogs = MimicLogs.subscribeToLiveLogs((newLog) => {
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    });

    return () => {
      // Remove CSS class when the component unmounts
      document.body.classList.remove("no-scroll");
      unsubscribeLiveLogs();
    };
  }, [selectedTimeRange]); // Refetch logs when selectedTimeRange changes

  useEffect(() => {
    // Autoscroll if user is at the latest log line
    const logContainer = logContainerRef.current;
    if (
      logContainer.scrollHeight - logContainer.scrollTop ===
      logContainer.clientHeight
    ) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [logs]); // Autoscroll when logs change

  const fetchLogs = (timeRange) => {
    setLoading(true);
    const endTs = endGraphTime || Date.now();
    let startTs;

    // Calculate start timestamp based on selected time range
    switch (timeRange) {
      case "Last 5 minutes":
        startTs = endTs - 1000 * 60 * 5;
        break;
      case "Last 15 minutes":
        startTs = endTs - 1000 * 60 * 15;
        break;
      case "Last 30 minutes":
        startTs = endTs - 1000 * 60 * 30;
        break;
      case "Last 1 hour":
        startTs = endTs - 1000 * 60 * 60;
        break;
      case "Last 3 hours":
        startTs = endTs - 1000 * 60 * 60 * 3;
        break;
      case "Last 6 hours":
        startTs = endTs - 1000 * 60 * 60 * 6;
        break;
      default:
        startTs = endTs - 1000 * 60 * 5; // Default to last 5 minutes
        break;
    }
    if (startGraphTime != null) {
      startTs = startGraphTime;
    }

    // Fetch logs for the selected time range
    MimicLogs.fetchPreviousLogs({ startTs, endTs })
      .then((newLogs) => {
        // Update the logs state with the fetched logs
        setLogs(newLogs);
        setLoadingCount(newLogs.length); // Set the loading count to the number of logs fetched
        setHasMore(false); // Assuming we don't need infinite scroll for selected time ranges
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleTimeRangeChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedTimeRange(selectedValue);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-end p-4">
        <select
          value={selectedTimeRange}
          onChange={handleTimeRangeChange}
          className="rounded-lg p-2 border-t border-b border-l text-gray-800 border-gray-200 bg-white"
        >
          <option value="Last 5 minutes">Last 5 minutes</option>
          <option value="Last 15 minutes">Last 15 minutes</option>
          <option value="Last 30 minutes">Last 30 minutes</option>
          <option value="Last 1 hour">Last 1 hour</option>
          <option value="Last 3 hours">Last 3 hours</option>
          <option value="Last 6 hours">Last 6 hours</option>
          <option value="Live Logs">Live Logs</option>
        </select>
      </div>
      <div
        className="flex-grow bg-black text-green-400 overflow-y-auto p-4 rounded-lg"
        style={{ overflowY: "scroll", paddingRight: "0px" }}
        ref={logContainerRef}
      >
        {logs.map((log, index) => (
          <div key={index} className="p-4">
            {new Date(log.timestamp).toLocaleString()} {log.message}
          </div>
        ))}
        {loading && <div className="text-center">Loading...</div>}
      </div>
    </div>
  );
}

export default LogScreen;
