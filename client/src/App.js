import "./App.css";
import React, { useEffect, useState } from "react";
import Hotel from "./components/hotelComponent";
import Pagination from "./components/paginationComponent";
import fetchData from "./helpers/fetching";

function App() {
  const [backendData, setBackendData] = useState([{}]);
  const [totalSize, setTotalSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const goPage = async (number) => {
    const data = await fetchData(number);
    setCurrentPage(data.page);
    setBackendData(data.hotels);
  };

  useEffect(() => {
    async function fetchAsync() {
      const data = await fetchData();
      setBackendData(data.hotels);
      setCurrentPage(data.page);
      setTotalSize(data.totalSize);
    }
    fetchAsync();
  }, []);

  return (
    <>
      {backendData.length === 0 ? (
        <>loading</>
      ) : (
        <main>
          <div className="App">
            {backendData.map((hotel) => {
              return <Hotel hotel={hotel} />;
            })}
          </div>

          <Pagination
            totalSize={totalSize}
            currentPage={currentPage}
            goPage={goPage}
          />
        </main>
      )}
    </>
  );
}

export default App;
