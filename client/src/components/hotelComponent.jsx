import React from "react";

const Hotel = ({ hotel }) => {
  return (
    <div className="hotel-card">
      <a href={hotel.url} target="_blank">
        <div className="card-header">
          <h2>{hotel.title}</h2>
        </div>
        <div className="card-image"></div>
        <div className="card-content">
          <p>{hotel.where}</p>
          <p>{hotel.price}/os</p>
        </div>
      </a>
    </div>
  );
};

export default Hotel;
