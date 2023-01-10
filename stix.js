app.get("/downloadstix", (req, res) => {
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
            v.type === "sha256" ||
            v.type === "TLP" ||
            v.type === "created"
        );
        let stixXml = `<?xml version="1.0" encoding="UTF-8"?>
        <stix:STIX_Package
          xmlns:stix="http://stix.mitre.org/stix-1"
          xmlns:stixCommon="http://stix.mitre.org/common-1"
          xmlns:cybox="http://cybox.mitre.org/cybox-2"
          xmlns:cyboxCommon="http://cybox.mitre.org/common-2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://stix.mitre.org/stix-1 ../stix_core.xsd">
          <stix:Indicators>`;

        filteredValues.forEach((v) => {
            if (v.type === "ip") {
                stixXml += `<stix:Indicator xsi:type="cybox:IPAddressObject-1.0">
                <cybox:Value>${v.value.replace(/[\[\]]/g, "")}</cybox:Value>
                <cybox:Observable_Source>
                <cyboxCommon:Information_Source_Type>Automated Indicator Sharing</cyboxCommon:Information_Source_Type>
                </cybox:Observable_Source>
                </stix:Indicator>`;
            } else if (v.type === "md5" || v.type === "sha1" || v.type === "sha256") {
                stixXml += `<stix:Indicator xsi:type="cybox:FileHashObject-1.0">
                <cybox:Hashes>
                <cybox:Hash>
                <cybox:Type>${v.type.toUpperCase()}</cybox:Type>
                <cybox:Simple_Hash_Value>${v.value}</cybox:Simple_Hash_Value>
                </cybox:Hash>
                </cybox:Hashes>
                <cybox:Observable_Source>
                <cyboxCommon:Information_Source_Type>Automated Indicator Sharing</cyboxCommon:Information_Source_Type>
                </cybox:Observable_Source>
                </stix:Indicator>; } else if (v.type === "domain") { stixXml += <stix:Indicator xsi:type="cybox:URIObject-1.0">
                cybox:Value${v.value.replace(/[[]]/g, "")}</cybox:Value>
                cybox:Observable_Source
                cyboxCommon:Information_Source_TypeAutomated Indicator Sharing</cyboxCommon:Information_Source_Type>
                </cybox:Observable_Source>
                </stix:Indicator>`;
                }
                });
                stixXml += `</stix:Indicators>
                </stix:STIX_Package>`;
            
                // set the headers
                res.setHeader("Content-Disposition", "attachment;filename=IOCS.xml");
                res.setHeader("Content-Type", "application/xml");
                // send the xml to the client
                res.send(stixXml);
            })
            .catch((error) => {
                console.error(error);
            });
            });
            
   
            
            
            
