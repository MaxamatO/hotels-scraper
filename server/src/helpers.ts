import * as fs from "fs";

const sortAandSave = (data: Array<any>) => {
  fs.writeFile(
    "data.json",
    JSON.stringify(
      data.sort((hotel1: any, hotel2: any) => {
        return hotel1.price - hotel2.price;
      })
    ),
    (err) => {
      if (err) console.log(err);
    }
  );
};

export default sortAandSave;
