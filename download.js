async function download(){
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");
    require("dotenv").config()
    const iocUrl = process.env.AXIOS_URL;

    const options = {
        headers: {
          "CN-USER-NAME": process.env.AXIOS_USERNAME,
          "X-API-KEY": process.env.AXIOS_KEY,
          Cookie: process.env.AXIOS_COOKIE,
        },
      };

    function getNestedValues(data) {
        let values = [];
        function traverse(obj) {
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const value = obj[key];
              if (Array.isArray(value)) {
                value.forEach((v) => {
                  if (v.type && v.value) {
                    values.push({ type: v.type, value: v.value });
                  } else {
                    traverse(v);
                  }
                });
              } else if (typeof value === "object") {
                traverse(value);
              } else if (key === "TLP" || key === "created") {
                values.push({ type: key, value });
              }
            }
          }
        }
        traverse(data);
        return values;
      }
      axios
    .get(iocUrl, options)
    .then((response) => {
      const data = response.data;
      const values = getNestedValues(data);
      // Filter the values based on the desired types
      const filteredValues = values.filter(
        (v) =>
          v.type === "domain" ||
          v.type === "md5" ||
          v.type === "ip" ||
          v.type === "sha1" ||
          v.type === "sha256"
      );
  
      //Remove square brackets from the IP and domains 
      filteredValues.forEach((v) => {
        if (v.type === "IP" || v.type === "domain") {
          v.value = v.value.replace(/[\[\]]/g, "");
        }
      });
  
      // Convert the data to CSV format
      const csvData = filteredValues.map((v) => `${v.type},${v.value}`).join("\n");
  
      // Write the data to a file
      const filePath = path.join(__dirname, "iocs.csv");
      fs.writeFileSync(filePath, csvData);
      // res.download(filePath);
    })
    .catch((error) => {
        console.error(error);
        res.send(error);
      });
  };
  download()
module.exports = { download};
