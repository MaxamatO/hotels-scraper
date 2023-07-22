import "./App.css";
import React, { useEffect, useState } from "react";

function App() {
  const [backendData, setBackendData] = useState([{}]);
  const [paginatedData, setPaginatedData] = useState([{}]);

  const paginate = (data) => {};

  useEffect(() => {
    fetch("/api")
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data);
      });
  }, []);

  return (
    <div className="App">
      {backendData.map((hotel) => {
        return (
          <div class="hotel-card">
            <a href={hotel.url} target="_blank">
              <div class="card-header">
                <h2>{hotel.title}</h2>
              </div>
              <div class="card-image"></div>
              <div class="card-content">
                <p>{hotel.where}</p>
                <p>{hotel.price}/os</p>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}

export default App;
