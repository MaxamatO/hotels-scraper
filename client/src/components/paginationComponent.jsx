import React from "react";

const Pagination = ({ totalSize, currentPage, goPage }) => {
  const numbers = [];
  for (let i = 1; i <= Math.ceil(totalSize / 6); i++) {
    numbers.push(i);
  }
  return (
    <div className="pagination-container">
      {numbers.map((number) => {
        return (
          <>
            {number === currentPage ? (
              <div
                key={number}
                onClick={() => goPage(number)}
                className="pagination-number active-page">
                {number}
              </div>
            ) : (
              <div
                key={number}
                onClick={() => goPage(number)}
                className="pagination-number">
                {number}
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

export default Pagination;
