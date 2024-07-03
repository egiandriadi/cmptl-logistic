import OrderValidationRequestInterface from "../../libs/order/order-validation-request.interface";
import { z } from "../../config/zod-config";
import { ZodError } from "zod"
import moment from "moment"
import { CodType, ErrorMessages } from "./constants";

export default class ValidationService {

  async validate(order: OrderValidationRequestInterface) {
    return new Promise((resolve, reject) => {
      try {
        const orderValidateSchema = z.object({
          tanggal_order: z.string({
            required_error: ErrorMessages.TANGGAL_ORDER.REQUIRED,
            invalid_type_error: ErrorMessages.TANGGAL_ORDER.INVALID,
          }).min(1, ErrorMessages.TANGGAL_ORDER.REQUIRED)
            .refine(this.validateOrderDate, ErrorMessages.TANGGAL_ORDER.MIN_DATE),
          pelanggan_hp: z.string({
            required_error: ErrorMessages.PELANGGAN_HP.REQUIRED,
            invalid_type_error: ErrorMessages.PELANGGAN_HP.IS_DIGIT,
          }).min(8, ErrorMessages.PELANGGAN_HP.INVALID)
            .max(50, ErrorMessages.PELANGGAN_HP.MAX)
            .regex(/^\d+$/, ErrorMessages.PELANGGAN_HP.IS_DIGIT),
          pelanggan_nama: z.string({
            required_error: ErrorMessages.PELANGGAN_NAMA.REQUIRED,
            invalid_type_error: ErrorMessages.PELANGGAN_NAMA.INVALID,
          }).min(1, ErrorMessages.PELANGGAN_NAMA.REQUIRED)
            .max(30, ErrorMessages.PELANGGAN_NAMA.MAX),
          pelanggan_alamat: z.string({
            required_error: ErrorMessages.PELANGGAN_ALAMAT.REQUIRED,
            invalid_type_error: ErrorMessages.PELANGGAN_ALAMAT.INVALID,
          }).min(1, ErrorMessages.PELANGGAN_ALAMAT.REQUIRED),
            // .max(85, ErrorMessages.PELANGGAN_ALAMAT.MAX),
          pelanggan_wilayah: z.number({
            required_error: ErrorMessages.PELANGGAN_WILAYAH.REQUIRED,
            invalid_type_error: ErrorMessages.PELANGGAN_WILAYAH.INVALID
          }).min(1, ErrorMessages.PELANGGAN_WILAYAH.REQUIRED),
          pelanggan_kota: z.string({
            required_error: ErrorMessages.PELANGGAN_KOTA.REQUIRED,
            invalid_type_error: ErrorMessages.PELANGGAN_KOTA.INVALID
          }).min(1, ErrorMessages.PELANGGAN_KOTA.REQUIRED)
            .max(20, ErrorMessages.PELANGGAN_KOTA.MAX),
          pelanggan_provinsi: z.string({
            required_error: ErrorMessages.PELANGGAN_PROVINSI.REQUIRED,
            invalid_type_error: ErrorMessages.PELANGGAN_PROVINSI.INVALID
          }).min(1, ErrorMessages.PELANGGAN_PROVINSI.REQUIRED)
            .max(25, ErrorMessages.PELANGGAN_PROVINSI.MAX),
          kode_pos: z.number({
            required_error: ErrorMessages.KODE_POS.REQUIRED,
            invalid_type_error: ErrorMessages.KODE_POS.INVALID
          }).refine((val) => val.toString().length === 5, ErrorMessages.KODE_POS.INVALID),
          metode_pembayaran: z.string({
            required_error: ErrorMessages.METODE_PEMBAYARAN.REQUIRED,
            invalid_type_error: ErrorMessages.METODE_PEMBAYARAN.INVALID
          }).refine((val) => val === CodType.COD || val === CodType.NON_COD, ErrorMessages.METODE_PEMBAYARAN.INVALID),
          nilai_cod: z.number({
            required_error: ErrorMessages.NILAI_COD.REQUIRED,
            invalid_type_error: ErrorMessages.NILAI_COD.IS_DIGIT
          }).min(1, ErrorMessages.NILAI_COD.REQUIRED),
          nilai_barang: z.number({
            required_error: ErrorMessages.NILAI_BARANG.REQUIRED,
            invalid_type_error: ErrorMessages.NILAI_BARANG.IS_DIGIT
          }).min(0, ErrorMessages.NILAI_BARANG.REQUIRED),
          nama_paket: z.string({
            required_error: ErrorMessages.NAMA_PAKET.REQUIRED,
            invalid_type_error: ErrorMessages.NAMA_PAKET.INVALID
          }).min(1, ErrorMessages.NAMA_PAKET.REQUIRED)
            .max(60, ErrorMessages.NAMA_PAKET.MAX),
          berat: z.number({
            required_error: ErrorMessages.BERAT.REQUIRED,
            invalid_type_error: ErrorMessages.BERAT.INVALID
          }).min(0.1, ErrorMessages.BERAT.REQUIRED),
          jumlah: z.number({
            required_error: ErrorMessages.JUMLAH.REQUIRED,
            invalid_type_error: ErrorMessages.JUMLAH.INVALID
          }).min(1, ErrorMessages.JUMLAH.REQUIRED),
          catatan_pengiriman: z.string({
            invalid_type_error: ErrorMessages.CATATAN_PENGIRIMAN.INVALID
          }).max(60, ErrorMessages.CATATAN_PENGIRIMAN.MAX),
          remark_1: z.any(),
          remark_2: z.any(),
          remark_3: z.any()
        }).required({
          pelanggan_nama: true,
          pelanggan_hp: true,
          pelanggan_alamat: true,
          pelanggan_wilayah: true,
          metode_pembayaran: true,
          nilai_cod: true,
          nilai_barang: true,
          nama_paket: true,
          berat: true,
          jumlah: true,
        }).partial({
          catatan_pengiriman: true
        })

        if (order.metode_pembayaran === CodType.NON_COD ) {
          const nonCod = z.object({
            nilai_cod: z.number({
              required_error: ErrorMessages.NILAI_COD.REQUIRED,
              invalid_type_error: ErrorMessages.NILAI_COD.IS_DIGIT
            }).min(0).refine((val) => val === 0, ErrorMessages.NILAI_COD.ON_NON_COD)
          })
          const nonCodSchema = orderValidateSchema.merge(nonCod);
          nonCodSchema.parse(order);
        }
        else  {
          orderValidateSchema.parse(order);        
        }

        resolve({})
      } catch (err) {
        const error = err as ZodError;
        let errors : any = {};
        error.issues.forEach(e => {
          const key : string = e.path[0].toString();
          errors[key] = e.message;
        });
        resolve(errors);
      }
    })
  }

  protected validateOrderDate = (val : string) : boolean => {
    const minimalDate = moment().format("YYYY-MM-DD");
    const res = moment(val).isSameOrAfter(minimalDate);
    // console.log(moment(val).format("YYYY-MM-DD"), minimalDate, res);
    return res;
  }

}