
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGridPremium } from '@mui/x-data-grid-premium';
import { GRID_AGGREGATION_FUNCTIONS,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-premium';
import { Accordion, Button, ButtonGroup, OverlayTrigger, Tooltip, Form, Modal } from "react-bootstrap";
import { readFile } from "../utils";
// import { getSpendingTotals } from '../breakdownFns.js';
import { setHeaders, setLoading } from "../redux/globalSlice";
import { styled } from "styled-components";
import Navbar from "../components/Navbar";
import useObserveDiv from "../useObserveDiv";

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
};

const Datagrid = () => {
  // const csv = useSelector((state) => state.csv);
  const allData = useSelector((state) => state.data);
  const chosen = useSelector((state) => state.chosen);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const theme = useSelector((state) => state.theme);
  const navOpen = useSelector((state) => state.navOpen);

  const dispatch = useDispatch();

  useObserveDiv();

  useEffect(() => {
    dispatch(setLoading(false));
    let headers, headerRow;

    let dataSet = allData[chosen];

    if (typeof dataSet === "string") {
      dataSet = dataSet.split("\n");
      headerRow = 0;
      while (dataSet[headerRow].split(",").length < 3) {
        headerRow++;
      }
      headers = dataSet[headerRow].split(",");
    } else {
      headers = Object.keys(dataSet[0]);
    }

    // Generate columns for DataGrid
    const cols = headers.map(header => {
      if (header.toLowerCase().includes("date")) {
        return {
        align: "center",
        aggregable: false,
        field: header.trim(),
        headerAlign: "center",
        headerName: header.trim(),
        width: 150,
        renderCell: (params) => {
          return (
            <div>
              {params.value ? new Date(params.value).toLocaleDateString() : ""}
            </div>
          );
        }
      }
    } else if (header.includes("Income") || header.includes("Expense") || header.includes("Residual") || header.includes("Commission") || header.includes("Payouts") || header.includes("Net_Income") || header.includes("Agent_Gross") || header.includes("Agent_Payable") || header.includes("Revenue")) {
      return {
        align: "center",
        field: header.trim(),
        headerAlign: "center",
        headerName: header.trim(),
        width: 160,
        type: "number",
        renderCell: (params) => {
          return params.value ? `$${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
        }
      };
    }
    else {
        return {
          align: "center",
          field: header.trim(),
          headerAlign: "center",
          headerName: header.trim(),
          width: 120,
        };
      }
    });

    // Generate rows
    let rowsData;
    console.log(typeof dataSet[0] !== "string", typeof dataSet[0]);
    if (typeof dataSet[0] !== "string") {
      rowsData = dataSet[0]['Account'] ? dataSet.map((item, i) => ({
        id: i,
        Account: item.Account,
        Agent_Gross: !isNaN(Number(item.Agent_Gross)) ? parseFloat(item.Agent_Gross.trim()) : 0,
        Agent_ID: item.Agent_ID,
        Agent_Payable: !isNaN(Number(item.Agent_Payable)) ? parseFloat(item.Agent_Payable.trim()) : 0,
        Commission: !isNaN(Number(item.Commission)) ? parseFloat(item.Commission.trim()) : 0,
        Company: item.Company,
        Date_Report: item.Date_Report ? new Date(item.Date_Report).toLocaleDateString() : "",
        Expense: !isNaN(Number(item.Expense)) ? parseFloat(item.Expense.trim()) : 0,
        Net_Income: !isNaN(Number(item.Net_Income)) ? parseFloat(item.Net_Income.trim()) : 0,
        Open_Date: item['Open Date'] ? new Date(item['Open Date']).toLocaleDateString() : "",
        Payouts: !isNaN(Number(item.Payouts)) ? parseFloat(item.Payouts.trim()) : 0,
        Period: item.Period,
        Period_Platform: item.Period_Platform,
        Revenue: !isNaN(Number(item.Revenue)) ? parseFloat(item.Revenue.trim()) : 0,
        z_pk_id: item.z_pk_id,
        zz_pk_residuals: item.zz_pk_residuals,
      })) : dataSet.map((item, i) => ({
        id: i,
        ...Object.keys(item).reduce((acc, key) => {
          acc[key] = item[key];
          return acc;
        }, {})
      }));
    } else {
      rowsData = dataSet.slice(headerRow + 1).map((row, i) => {
        const values = row.split(",");
        console.log(values);
        if (!values[0]) return null;
        const rowData = { id: i };
        headers.forEach((header, index) => {
          if (header === "Date Approved") {
            rowData[header.trim()] = values[index] ? new Date(values[index].trim()) : "";
          } else if (header.trim() === "Income" || header.trim() === "Expense" || header.trim() === "Residual") {
            rowData[header.trim()] = !isNaN(Number(values[index])) ? parseFloat(values[index].trim()) : 0;
          } else {
            rowData[header.trim()] = values[index] ? values[index].trim() : "";
          }
        });
        return rowData;
      }).filter(row => row !== null);
    }

    dispatch(setHeaders(headers));
    setColumns(cols);
    setRows(rowsData);
  }, []);
  console.log(rows, columns);
  return (
    <div className={theme} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100vw" }}>
      <Navbar />
        <div className="main-content">
        <StyledWrapper
          color={theme === "dark" ? "white" : "black"}
          nav = {navOpen}
          >
            <DataGridPremium
              aggregationFunctions={Object.fromEntries(
                Object.entries(GRID_AGGREGATION_FUNCTIONS).filter(
                  ([name]) => name !== 'size',
                ),
              )}
              checkboxSelection={false}
              columns={columns}
              // disableColumnMenu
              disableRowSelectionOnClick
              // getRowHeight={() => 'auto'}
              initialState={{
                aggregation: {
                  model: {
                    Income: 'sum',
                    Expense: 'sum',
                    Residual: 'sum',
                  },
                },
                density: "standard",
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                  },
                },
                // rowGrouping: {
                //   autoExpand: true,
                //   model: [ 'Agent Name', 'Merchant Name' ],
                // },
              }}
              pagination
              pageSizeOptions={[ 10, 25, 50, 100, 1000 ]}
              // rowHeight={100}
              rows={rows}
              slots={{ toolbar: CustomToolbar }}
              // sx={{
              //   "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell .btn":
              //     {
              //       height: "2rem",
              //       paddingLeft: "8px",
              //       paddingRight: "8px",
              //     },
              //   "&.MuiDataGrid-root--densityCompact a": {
              //     marginTop: "2px",
              //     fontSize: ".75rem",
              //   },
              //   "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell .btn":
              //     {
              //       height: "3rem",
              //     },
              //   "&.MuiDataGrid-root--densityStandard a": {
              //     marginTop: "4px",
              //   },
              //   "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell .btn":
              //     {
              //       height: "3.7rem",
              //     },
              //   "&.MuiDataGrid-root--densityComfortable a": {
              //     marginTop: "7px",
              //   },
              //   ".MuiDataGrid-footerContainer": {
              //     display: "none",
              //   },
              //   "&.MuiDataGrid-root": {
              //     border: "2px dashed red",
              //   },
              // }}
            />
          </StyledWrapper>
          </div>
    </div>

  );
};

export default Datagrid;

const StyledWrapper = styled.div`
  height: 97vh;
  width: ${(props) => props.nav ? '99%' : '95vw'};
  max-width: 88vw;
  margin-top: 1%;
  margin-left: 1%;
  margin-right: 2%;

  .btn-group {
    font-size: xx-small;
  }
  .MuiDataGrid-root {
    text-align: center;
    background-color: ${(props) => props.color === "white" ? "slate" : "white"};
    color: ${(props) => props.color};
    border-color: ${(props) => props.color};
  }
  .MuiDataGrid-columnHeaderTitle {
    font-size: 0.75rem;
    line-height: 1.2;
    white-space: normal;
    overflow: visible;
    font-weight: bold;
  }
  .MuiDataGrid-cell {
    background-color: ${(props) => props.color === "white" ? "slate" : "white"};
    font-size: 0.75rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
  }
  .MuiDataGrid-columnHeader {
    background-color: ${(props) =>
      props.color === "white" ? "black" : "lightgrey"};
    color: ${(props) => props.color};
  }
  .MuiDataGrid-footerContainer {
    background-color: ${(props) =>
      props.color === "white" ? "black" : "lightgrey"};
    color: ${(props) => props.color};
  }
  .MuiTablePagination-toolbar {
    color: ${(props) => props.color};
    margin: auto;
  }
  .css-mmygx2-MuiSelect-select-MuiInputBase-input,
  .MuiSelect-icon,
  .MuiTablePagination-selectIcon,
  .MuiSelect-iconStandard {
    // rows per page select dropdown
    color: ${(props) => props.color};
    padding: 0;
  }
  .css-1y51iz2 input {
    color: ${(props) => props.color};
  }
  .css-120dh41-MuiSvgIcon-root,
  .css-5h82ro-MuiInputBase-root-MuiInput-root {
    fill: ${(props) => props.color};
    color: ${(props) => props.color};
  }
  .MuiSvgIcon-root MuiSvgIcon-fontSizeSmall,
  .css-vh810p {
    fill: ${(props) => props.color};
  }
  .css-17ixm6u-MuiButtonBase-root-MuiIconButton-root.Mui-disabled {
    // disabled button
    color: darkgrey;
  }
  .MuiTablePagination-actions {
    margin-right: 55px;
  }
  .MuiTablePagination-selectLabel {
    // Row per page label
    margin: auto;
    color: ${(props) => props.color};
  }
  .MuiTablePagination-displayedRows {
    margin: auto;
    color: ${(props) => props.color};
  }
  .MuiDataGrid-aggregationColumnHeaderLabel {
    color: #8e8e8e
  }
  .MuiDataGrid-root .MuiDataGrid-container--top [role="row"],
  .MuiDataGrid-root .MuiDataGrid-container--bottom [role="row"] {
    background-color: ${(props) => props.color === "white" ? "#202020" : "white"};
    font-size: 1.2rem;
    font-weight: bold;
  }
  .MuiDataGrid-scrollbarFiller,
  .MuiDataGrid-scrollbarFiller--header {
    background-color: ${(props) =>
      props.color === "white" ? "black" : "lightgrey"};
  }
  .css-v7i629-MuiDataGrid-root .MuiDataGrid-iconSeparator {
    color: ${(props) => props.color};
  }
  .MuiDataGrid-sortIcon {
    color: ${(props) => props.color};
  }
  .MuiDataGrid-menuIconButton {
    color: ${(props) => props.color};
  }
  .btn {
    height: 3rem;
    width: 3rem;
    margin: auto;
  }
  h1, h2, h3, h4, h5, h6 {
    text-align: center;
}
`;

// example below
// const CustomFooter = ({ aiMessage, aiTextReceived, setAiMessage, closeAI, sendText, recipient, seconds, setAiTextReceived, theme, openAI }:
//   { aiMessage: string, aiTextReceived: boolean, setAiMessage: any, closeAI: any, sendText:any, recipient: string, seconds: number, setAiTextReceived:any, theme: string, openAI: any}) => {
//     const [userMessage, setUserMessage] = useState(aiMessage);

//   return (
//     <div style={{ padding: "1rem", borderTop: `1px solid ${theme === 'dark' ? 'white' : 'black'}`, height: '280px' }}>
//       <h1>AI Follow-Up to {recipient}</h1>
//         {aiTextReceived ? (
//           <div>
//             <textarea onChange={(e) => setUserMessage(e.target.value)} rows={6} style={{ width: "90%", maxHeight:'150px', minHeight:'50px' }} value={userMessage}/>
//             <div style={{ display: "flex", justifyContent: "space-evenly", margin: "1rem" }}>
//               <Button onClick={closeAI} style={{minWidth:'5rem'}} variant="secondary" >Close</Button>
//               <Button onClick={() =>{setAiTextReceived(false); openAI(null)}} style={{maxWidth:'3rem'}} title='Refresh' variant="primary">
//                 <i className="fa-solid fa-rotate-right"></i></Button>
//               <Button onClick={() => sendText(userMessage)} style={{minWidth:'6rem'}} variant="success">Send <i className="fa-regular fa-paper-plane"></i></Button>
//             </div>
//           </div>
//         ) : (
//           <div style={{fontSize:'1.5rem', textAlign:'center'}}>
//             <br/>
//             {aiMessage !== 'NO' ? <div>
//               Generating Message{<span>
//             {(() => {
//               switch (seconds % 3) {
//                 case 0:
//                   return '...';
//                 case 1:
//                   return '.\u00A0\u00A0';
//                 case 2:
//                   return '..\u00A0';
//                 default:
//                   return '';
//               }
//             })()}
//             </span>}
//               <br/><br/>
//               <i className={`fa-solid ${seconds % 3 === 0 ? 'fa-face-grin-wide' : seconds % 2 === 0 ? "fa-face-smile-wink" : 'fa-robot'} fa-bounce`}></i>
//             </div>
//             : <><br/><br/><span>No AI Message Available, Exiting
//               {(() => {
//               switch (seconds % 3) {
//                 case 0:
//                   return '.\u00A0\u00A0';
//                 case 1:
//                   return '..\u00A0';
//                 case 2:
//                   return '...';
//                 default:
//                   return '';
//               }
//             })()}
//               </span></>}
//             <br/>
//             <div style={{display: 'flex', flexDirection:'row', justifyContent:'flex-end', width: '100%'}}>
//               <Button className={`btn-xs btn-${theme}`} onClick={closeAI} style={{margin: 0}} title="Cancel">X</Button></div>
//           </div>
//         )}
//     </div>
//   );
// }



  // const columns: GridColDef[] = [
  // {
  //   align: "left",
  //   headerAlign: "center",
  //   field: "name",
  //   headerName: "Name",
  //   flex: 0.9,
  //   renderCell: (params) => (
  //     <div
  //       style={{
  //         display: "flex",
  //         alignItems: "center",
  //       }}
  //     >
  //       <ConfirmButton
  //         ConfirmIcon={() =>
  //           reservedLeadToBoolean(
  //             params.row.item.properties?.reserved_lead
  //           ) || params.row.item.properties?.source === "Self-Sourced" ? (
  //             <i className="fa-solid fa-xmark fa-lg"></i>
  //           ) : (
  //             <i className="fa-solid fa-check fa-lg"></i>
  //           )
  //         }
  //         Icon={() =>
  //           reservedLeadToBoolean(
  //             params.row.item.properties?.reserved_lead
  //           ) || params.row.item.properties?.source === "Self-Sourced" || params.row.item.properties?.protected_lead? (
  //             <i className="fa-solid fa-shield fa-lg"></i>
  //           ) : (
  //               getLastContactedDate(params.row.item)
  //                 ? new Date(getLastContactedDate(params.row.item) || "") >=
  //                   new Date(Date.now() - 48 * 60 * 60 * 1000)
  //                 : false
  //             ) ? (
  //             <i className="fa-solid fa-lock fa-lg"></i>
  //           ) : (
  //             <i className="fa-solid fa-lock-open fa-lg"></i>
  //           )
  //         }
  //         action={() => {
  //           setReservedLead(
  //             params.row.item.id,
  //             !reservedLeadToBoolean(
  //               params.row.item.properties?.reserved_lead
  //             )
  //           );

  //           //FIXXX
  //           /**
  //            * Add Reserved Lead -- func
  //            * @param data
  //            */
  //           const addReservedLead = function (data: any) {
  //             lisaFive9Http(
  //               (window as any).hubAppGlobal.user,
  //               "/hubspot/reserve-add",
  //               "POST",
  //               data,
  //               (window as any).hubAppGlobal.token,
  //               undefined,
  //               "/api/crm"
  //             ).then((response: any) => {
  //               if (response.Status !== 200) {
  //                 //todo show toast
  //                 utils.sentryError(
  //                   "Failed to reserve lead", {
  //                     message: response?.Message,
  //                     data: data,
  //                     endpoint: "/hubspot/reserve-add",
  //                   }
  //                 );
  //                 toast.error("Failed to reserve lead");
  //               } else {
  //                 toast.success("Lead reserved");
  //               }
  //             });
  //           };

  //           /**
  //            * Remove Reserved Lead -- func
  //            * @param data
  //            */
  //           const removeReservedLead = function (
  //             data: any | undefined = undefined
  //           ) {
  //             lisaFive9Http(
  //               (window as any).hubAppGlobal.user,
  //               "/hubspot/reserve-remove",
  //               "POST",
  //               data,
  //               (window as any).hubAppGlobal.token,
  //               undefined,
  //               "/api/crm"
  //             ).then((response: any) => {
  //               if (response.Status !== 200) {
  //                 console.error(
  //                   "Failed to remove reserved lead" + response?.Message
  //                 );
  //                 toast.error("Failed to remove reserved lead");
  //               } else {
  //                 toast.success("Lead unreserved");
  //               }
  //             });
  //           };

  //           let data = {
  //             HubSpotID: params.row.item.id,
  //             Agent: agent?.email,
  //           };

  //           reservedLeadToBoolean(params.row.item.properties?.reserved_lead)
  //             ? removeReservedLead(data)
  //             : addReservedLead(data);

  //           // postMessage({
  //           //   action: reservedLeadToBoolean(
  //           //     params.row.item.properties?.reserved_lead
  //           //   )
  //           //     ? "RemoveReservedLead"
  //           //     : "AddReservedLead",
  //           //   value: {
  //           //     HubSpotID: params.row.item.id,
  //           //     Agent: agent?.email,
  //           //   },
  //           // });
  //         }}
  //         // buttonStyles={{ borderRadius: 0 }}
  //         confirmText={`Click again to ${
  //           reservedLeadToBoolean(params.row.item.properties?.reserved_lead)
  //             ? "unshield"
  //             : "shield"
  //         } lead`}
  //         initialVariant={
  //           reservedLeadToBoolean(
  //             params.row.item.properties?.reserved_lead
  //           ) || params.row.item.properties?.source === "Self-Sourced"
  //             ? params.row.item.properties?.source === "Self-Sourced"
  //               ? "primary"
  //               : "success"
  //             : (
  //                 getLastContactedDate(params.row.item)
  //                   ? new Date(getLastContactedDate(params.row.item) || "") >=
  //                     new Date(Date.now() - 48 * 60 * 60 * 1000)
  //                   : false
  //               )
  //             ? "primary"
  //             : "warning"
  //         }
  //         size="sm"
  //         tooltipText={
  //           reservedLeadToBoolean(
  //             params.row.item.properties?.reserved_lead
  //           ) || params.row.item.properties?.source === "Self-Sourced"
  //             ? params.row.item.properties?.source === "Self-Sourced"
  //               ? "Protected: This lead is protected because it is self-sourced."
  //               : "Protected: This lead is protected and cannot be reassigned. Click to unprotect."
  //             : (
  //                 getLastContactedDate(params.row.item)
  //                   ? new Date(getLastContactedDate(params.row.item) || "") >=
  //                     new Date(Date.now() - 48 * 60 * 60 * 1000)
  //                   : false
  //               )
  //             ? "Lead is Protected: Contact made within the last 48 hours. Click to protect."
  //             : "Lead is Unprotected: Contact was NOT made within the last 48 hours. Click to protect."
  //         }
  //       />
  //       <Button
  //         onClick={() => {
  //           window.open(
  //             `https://app.hubspot.com/contacts/23432035/contact/${params.row.item.id}`,
  //             "_blank"
  //           );
  //         }}
  //         title={`Open HubSpot Contact ${
  //           params.row.item.properties?.suspended_flag === "true"
  //             ? "(Suspended)"
  //             : ""
  //         }`}
  //         variant="link"
  //       >
  //         {getName(params.row.item)}
  //         {params.row.item.properties?.suspended_flag === "true" && (
  //           <>
  //             &nbsp;
  //             <i
  //               className="fa-solid fa-phone-slash fa-sm"
  //               style={{ color: "red" }}
  //             ></i>
  //           </>
  //         )}
  //       </Button>
  //     </div>
  //   ),
  // },
  // {
  //   align: "center",
  //   headerAlign: "center",
  //   field: "assignedDate",
  //   headerName: "Assigned Date",
  //   flex: 0.6,
  //   renderCell: (params) => (
  //     <>
  //     { params.row.assignedDate.toLocaleString(
  //       "en-US",
  //       {
  //         month: "numeric",
  //         day: "numeric",
  //         hour: "numeric",
  //         minute: "numeric",
  //         hour12: true,
  //       }
  //     ) }
  //     </>
  //   )
  // },
  // {
  //   align: "center",
  //   headerAlign: "center",
  //   field: "lastContacted",
  //   headerName: "Last Contacted",
  //   flex: 0.6
  // },
  // {
  //   align: "center",
  //   headerAlign: "center",
  //   field: "scheduledCallback",
  //   headerName: "Scheduled Callback",
  //   flex: 0.8,
  //   renderCell: (params) => (
  //     <div style={{ display: "flex", alignItems: "center" }}>
  //       <ScheduledCallbackModal hubspotObj={params.row.item} />
  //       &nbsp;
  //       {params.row.callback ? (
  //         <span
  //           style={{
  //             color:
  //               new Date(params.row.callback) < new Date()
  //                 ? "#ff6f61"
  //                 : undefined,
  //           }}
  //         >
  //           {params.row.callback}
  //         </span>
  //       ) : (
  //         params.row.callback
  //       )}
  //     </div>
  //   ),
  // },
  // {
  //   align: "left",
  //   headerAlign: "center",
  //   field: "action3",
  //   headerName: "",
  //   flex: 2.2,
  //   minWidth: 460,
  //   sortable: false,
  //   filterable: false,
  //   renderCell: (params) => (
  //     <>
  //       <Button
  //         className={`btn btn-xs btn-dark`}
  //         onClick={() => {
  //           eventEmitter.emit("showClientMortgagePartnerModal", {
  //             show: true,
  //             id: params.row.item.id,
  //             contact_type: params.row.item.contact_type,
  //           });
  //         }}
  //         title="Open Mortgage Partners"
  //         type="button"
  //       >
  //         <i className="fa fa-user fa-person fa-lg"></i>
  //       </Button>
  //       &nbsp;
  //       <Button
  //         className={`btn btn-xs btn-dark`}
  //         onClick={() => {
  //           eventEmitter.emit("showClientDealsModal", {
  //             show: true,
  //             id: params.row.item.id,
  //             contact_type: params.row.item.contact_type,
  //           });
  //         }}
  //         title="Open Deals"
  //         type="button"
  //       >
  //         <i className="fa fa-book fa-lg"></i>
  //       </Button>
  //       &nbsp;
  //       <Button
  //         className={`btn btn-xs btn-dark`}
  //         disabled={showFooter}
  //         onClick={() => {setHSId(params.row.item.id); setRecipient(params.row.item.properties.firstname + " " + params.row.item.properties.lastname); openAI(params.row.item.id)}}
  //         title="Open AI Follow-up"
  //         type="button"
  //       >
  //         <i className="fa-regular fa-paper-plane"></i>
  //       </Button>
  //       <ButtonGroup>
  //         <OverlayTrigger
  //           overlay={
  //             params.row.item.properties?.notes ? (
  //               <Tooltip className="in" placement="top">
  //                 <div
  //                   dangerouslySetInnerHTML={{
  //                     __html: params.row.item.properties?.notes,
  //                   }}
  //                 />
  //               </Tooltip>
  //             ) : (
  //               <></>
  //             )
  //           }
  //           placement="top"
  //         >
  //           <Button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               toggleModal(params.row.id);
  //             }}
  //           >
  //             {params.row.item.properties?.notes ? (
  //               <i className="fa-regular fa-file-lines fa-lg"></i>
  //             ) : (
  //               <i className="fa-solid fa-file fa-lg"></i>
  //             )}
  //           </Button>
  //         </OverlayTrigger>
  //         <HubSpotDetailsModal item={params.row.item} mode="standard" />
  //         <ReferModal item={params.row.item} />
  //         <OverlayTrigger
  //           overlay={
  //             <Tooltip className="in" placement="top">
  //               Click to expand BotSplash
  //             </Tooltip>
  //           }
  //           placement="top"
  //         >
  //           <Button
  //             onClick={
  //               () => utils.openBotSplash(params.row.item.id)
  //               // postMessage({
  //               //   action: "OpenBotSplash",
  //               //   value: params.row.item.id,
  //               // })
  //             }
  //           >
  //             <i className="fa-solid fa-comment-sms fa-lg"></i>
  //           </Button>
  //         </OverlayTrigger>
  //         <ConfirmButton
  //           ConfirmIcon={() => (
  //             <i className="fa-solid fa-phone-volume fa-lg"></i>
  //           )}
  //           Icon={() => <i className="fa-solid fa-phone fa-lg"></i>}
  //           action={() => {
  //             postMessage({
  //               action: "DialNumber",
  //               value: {
  //                 number: formatPhoneToDigitsOnly(params.row.phone),
  //                 campaignId: "300000000000736",
  //                 five9_id: params.row.item.properties?.five9_id,
  //               },
  //             });
  //           }}
  //           buttonStyles={{ borderRadius: 0 }}
  //           confirmText="Click again to confirm call"
  //           disabled={isReady || !params.row.phone}
  //           disabledTooltipText={isReady ? "Button disabled while in Ready mode. Switch to Not Ready mode to enable this button and make an outbound call."
  //             : !params.row.phone ? "No phone number available" : ""
  //           }
  //           tooltipText={formatPhoneNumber(params.row.phone)}
  //         />
  //         {showFooter ?
  //         <OverlayTrigger
  //           overlay={
  //             <Tooltip className="in" placement="top">
  //               {confirmRemove[params.row.id]
  //             ? "Click again to unassign lead"
  //             : "Unassign"}
  //           </Tooltip>
  //         }
  //         placement="top"
  //         >
  //         <Button
  //           onClick={(e) => {
  //           e.stopPropagation();
  //           setConfirmRemove((prev) => ({
  //             ...prev,
  //             [params.row.id]: !prev[params.row.id],
  //           }));

  //           if (confirmRemove[params.row.id]) {
  //             setConfirmRemove((prev) => ({
  //             ...prev,
  //             [params.row.id]: false,
  //             }));
  //             setConfirmRemove((prev) => ({
  //               ...prev,
  //               [params.row.id]: !prev[params.row.id],
  //             }));

  //                 setTimeout(() => {
  //                   setConfirmRemove((prev) => ({
  //                     ...prev,
  //                     [params.row.id]: false,
  //                     }));
  //                 }, 3000);

  //                 /**
  //                  * Remove from Hotlist -- func
  //                  * @param HubSpotID
  //                  */
  //                 const removeFromHotlist = function (HubSpotID: any) {
  //                   if (true) {
  //                     //if (HubSpotID && five9Utils.tools.isLoanOfficer(agentGroups)) {
  //                     lisaFive9Http(
  //                       (window as any).hubAppGlobal.user,
  //                       "/hubspot/hotlist-remove",
  //                       "POST",
  //                       { HubSpotID },
  //                       (window as any).hubAppGlobal.token,
  //                       undefined,
  //                       "/api/crm"
  //                     ).then((result: any) => {
  //                       document.dispatchEvent(
  //                         new CustomEvent("hubWindowPostMessage", {
  //                           detail: {
  //                             HotlistRemoved: result.Status === 200,
  //                             Id: HubSpotID,
  //                           },
  //                         })
  //                       );
  //                     });
  //                   }
  //                 };
  //                 removeFromHotlist(params.row.item.id);

  //                 // postMessage({
  //                 //   action: "RemoveFromHotlist",
  //                 //   value: params.row.item.id,
  //                 // });
  //               }
  //             }}
  //             variant={
  //               confirmRemove[params.row.id]
  //                 ? "danger"
  //                 : confirmedRemove[params.row.id]
  //                 ? "success"
  //                 : "secondary"
  //             }
  //           >
  //             {confirmRemove[params.row.id] ? (
  //               <i className="fa-solid fa-trash fa-lg"></i>
  //             ) : confirmedRemove[params.row.id] ? (
  //               <i className="fa-solid fa-check fa-lg"></i>
  //             ) : (
  //               <i className="fa-solid fa-xmark fa-lg"></i>
  //             )}
  //           </Button>
  //         </OverlayTrigger>

  //         : <ClickAwayListener onClickAway={() => setConfirmRemove({})}>
  //           <OverlayTrigger
  //             overlay={
  //               <Tooltip className="in" placement="top">
  //                 {confirmRemove[params.row.id]
  //               ? "Click again to unassign lead"
  //               : "Unassign"}
  //             </Tooltip>
  //           }
  //           placement="top"
  //           >
  //           <Button
  //             onClick={(e) => {
  //             e.stopPropagation();
  //             setConfirmRemove((prev) => ({
  //               ...prev,
  //               [params.row.id]: !prev[params.row.id],
  //             }));

  //             if (confirmRemove[params.row.id]) {
  //               setConfirmRemove((prev) => ({
  //               ...prev,
  //               [params.row.id]: false,
  //               }));
  //               setConfirmRemove((prev) => ({
  //                 ...prev,
  //                 [params.row.id]: !prev[params.row.id],
  //               }));

  //                   setTimeout(() => {
  //                     setConfirmRemove((prev) => ({
  //                       ...prev,
  //                       [params.row.id]: false,
  //                       }));
  //                   }, 3000);

  //                   /**
  //                    * Remove from Hotlist -- func
  //                    * @param HubSpotID
  //                    */
  //                   const removeFromHotlist = function (HubSpotID: any) {
  //                     if (true) {
  //                       //if (HubSpotID && five9Utils.tools.isLoanOfficer(agentGroups)) {
  //                       lisaFive9Http(
  //                         (window as any).hubAppGlobal.user,
  //                         "/hubspot/hotlist-remove",
  //                         "POST",
  //                         { HubSpotID },
  //                         (window as any).hubAppGlobal.token,
  //                         undefined,
  //                         "/api/crm"
  //                       ).then((result: any) => {
  //                         document.dispatchEvent(
  //                           new CustomEvent("hubWindowPostMessage", {
  //                             detail: {
  //                               HotlistRemoved: result.Status === 200,
  //                               Id: HubSpotID,
  //                             },
  //                           })
  //                         );
  //                       });
  //                     }
  //                   };
  //                   removeFromHotlist(params.row.item.id);

  //                   // postMessage({
  //                   //   action: "RemoveFromHotlist",
  //                   //   value: params.row.item.id,
  //                   // });
  //                 }
  //               }}
  //               variant={
  //                 confirmRemove[params.row.id]
  //                   ? "danger"
  //                   : confirmedRemove[params.row.id]
  //                   ? "success"
  //                   : "secondary"
  //               }
  //             >
  //               {confirmRemove[params.row.id] ? (
  //                 <i className="fa-solid fa-trash fa-lg"></i>
  //               ) : confirmedRemove[params.row.id] ? (
  //                 <i className="fa-solid fa-check fa-lg"></i>
  //               ) : (
  //                 <i className="fa-solid fa-xmark fa-lg"></i>
  //               )}
  //             </Button>
  //           </OverlayTrigger>
  //         </ClickAwayListener>}
  //       </ButtonGroup>
  //       <Modal
  //         centered
  //         onHide={() => toggleModal(params.row.id)}
  //         show={showModals[params.row.id]}
  //       >
  //         <Modal.Header closeButton>
  //           <Modal.Title>Notes for Loan ID {params.row.item.id}</Modal.Title>
  //         </Modal.Header>
  //         <div>
  //           <SunEditor
  //             height="300px"
  //             onBlur={(_, content) => {
  //               updateLocalNote(content, params.row.item.id, params.row.item);
  //             }}
  //             onChange={(content) => noteChanged(content, params.row.item)}
  //             setContents={params.row.item.properties?.notes}
  //             setDefaultStyle="font-family: arial; font-size: 14px"
  //             setOptions={{
  //               buttonList,
  //             }}
  //           />
  //           <div style={{ textAlign: "center" }}>
  //             <Form.Text>
  //               {unsavedChanges ? "Unsaved Changes" : "Changes Saved!"}
  //             </Form.Text>
  //           </div>
  //         </div>
  //       </Modal>
  //     </>
  //   ),
  // },
  // ];


  // Map hotlist items to rows

  // const rows = (filteredHotlist ?? hotlist)?.map((item: any) => ({
  //   id: item.id,
  //   name: item.properties.firstname + " " + item.properties.lastname,
  //   assignedDate: item.properties?.hubspot_owner_assigneddate
  //     ? new Date(item.properties?.hubspot_owner_assigneddate)
  //     : "",
  //   lastContacted: getLastContactedDate(item) ?? 'Unknown',
  //   callback: item.properties?.callback_appointment_ts
  //     ? new Date(item.properties.callback_appointment_ts).toLocaleString()
  //     : "",
  //   phone: getValidHubspotPhone(item),
  //   item: item,
  // }));
