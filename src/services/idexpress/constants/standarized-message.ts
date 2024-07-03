const StandarizedMessage = {
  "Pickup": "Paket telah di pickup oleh %s",
  "Sending": "Paket dalam transit ke %s",
  "Arrival": "Paket telah sampai di %s",
  "Delivery": "Paket sedang dalam pengiriman oleh %s",
  "POD": "Paket telah di terima oleh %s, %s",
  //note: [Relation] will be shown if relation != Null
  "Return POD": "Paket retur telah diterima oleh %s",
  "Problem on Shipment": "Pengiriman bermasalah dikarenakan %s",
  "Confirm Return Bill": "Paket akan di return",
  "Pickup Failure": "Paket gagal di pick up dikarenakan %s"
}

interface MessageEntry {
  status: string;
  message: string;
}

const Message: MessageEntry[] = Object.entries(StandarizedMessage).map(([status, message]) => ({
  status,
  message
}));

export default Message;