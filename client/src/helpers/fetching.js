const fetchData = async (number = 1) => {
  const data = fetch(`/api?page=${number}`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((err) => console.log(err));
  return data;
};

export default fetchData;
