export default interface OrderResponseInterface {
  tracking_number: string;
  order_id: string;
  tlc_code: string | null;
}