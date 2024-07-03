const LastStatusData = {
  "Pick up scan" : "Pickup",
  "Loading scan" : "Pickup",
  "Sending scan" : "Sending",
  "Arrival scan" : "Arrival",
  "Unloading scan" : "Arrival",
  "Delivery Scan" : "Delivery",
  "POD scan" : "POD",
  "POD Entry" : "POD",
  //Return Confirm (unused)
  "Return POD Scan" : "Return POD",
  "Problem On Shipment scan" : "Problem on Shipment",
  "Create Return Bill" : "Problem on Shipment",
  "Confirm Return Bill" : "Returned",
  "Pickup Failure" : "Pickup Failed",
  "Dropped Off at Store" : "Dropped Off at Store"
}
interface StatusEntry {
  operationType: string;
  status: string;
}

const LastStatus: StatusEntry[] = Object.entries(LastStatusData).map(([operationType, status]) => ({
  operationType,
  status
}));

export default LastStatus;